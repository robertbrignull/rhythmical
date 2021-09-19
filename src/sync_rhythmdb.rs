extern crate htmlescape;
extern crate percent_encoding;
extern crate serde_json;

use percent_encoding::percent_decode;
use std::collections::HashMap;
use std::fs::File;
use std::io::BufRead;
use std::io::BufReader;
use std::path::Path;

use args::SyncRhythmdbArgs;
use gsutil;
use htmlescape::decode_html;
use library::{Library, Song};

#[derive(PartialEq)]
enum Element {
    Entry,
    CloseEntry,
    Title(String),
    Genre(String),
    Artist(String),
    Album(String),
    Duration(u32),
    Rating(u32),
    Location(String),
    Unknown,
    EOF,
}

pub fn sync_rhythmdb(args: SyncRhythmdbArgs) {
    let library_location_prefix = sanitise_library_location_prefix(&args.library_location_prefix);

    let source_library = read_rhythmdb(&args.rhythmdb_file, &library_location_prefix);
    let dest_library = Library::new(&args.project_name);
    let source_songs = LibraryHash::new(&source_library);
    let dest_songs = LibraryHash::new(&dest_library);

    let mut matched_songs: Vec<(Song, Song)> = Vec::new();
    let mut new_songs: Vec<Song> = Vec::new();
    let mut removed_songs: Vec<Song> = Vec::new();
    for song in source_library.songs.values() {
        match dest_songs.lookup(song) {
            Some(matched_song) => {
                matched_songs.push((song.clone(), matched_song));
            }
            None => {
                new_songs.push(song.clone());
            }
        }
    }
    for song in dest_library.songs.values() {
        match source_songs.lookup(song) {
            None => {
                removed_songs.push(song.clone());
            }
            _ => {} // Would have been matched in the other direction already
        }
    }

    println!("Matched {} songs", matched_songs.len());
    println!("Found {} new songs", new_songs.len());
    println!("Found {} removed songs", removed_songs.len());

    // Upload all new songs
    let mut failed_new_song_ids: Vec<u32> = Vec::new();
    for song in &mut new_songs {
        let new_file_location = song.generate_file_location();
        if args.dry_run {
            println!(
                "Would upload {} to {}",
                song.file_location, new_file_location
            );
        } else {
            println!("Uploading {} to {}", song.file_location, new_file_location);
            let upload_result = gsutil::upload(
                &args.project_name,
                &format!("{}{}", library_location_prefix, song.file_location),
                &format!("/Music{}", new_file_location),
            );
            if upload_result.is_err() {
                println!("Failed to upload {}", song.file_location);
                failed_new_song_ids.push(song.id);
            }
        }
        song.file_location = new_file_location;
    }

    // Handle any songs that fail to upload
    new_songs.retain(|song| !failed_new_song_ids.contains(&song.id));

    // Construct the new library and save it
    let new_library = Library::combine_libraries(&matched_songs, &new_songs);
    println!(
        "Constructed new library with {} songs",
        new_library.songs.len()
    );
    if args.dry_run {
        println!("Would upload new library");
    } else {
        println!("Uploading library");
        let library_file = "/tmp/new_library.json";
        if Path::new(library_file).exists() {
            std::fs::remove_file(library_file).unwrap();
        }
        new_library
            .serialize(&library_file)
            .expect("Unable to serialize library");
        gsutil::upload(
            &args.project_name,
            &library_file.to_string(),
            "/library.json",
        )
        .unwrap();
        std::fs::remove_file(library_file).unwrap();
    }

    // Delete all removed songs
    for song in removed_songs {
        if args.dry_run {
            println!("Would delete {}", song.file_location);
        } else {
            println!("Deleting {}", song.file_location);
            gsutil::rm(&args.project_name, &format!("/Music{}", song.file_location)).unwrap();
        }
    }
}

fn sanitise_library_location_prefix(prefix: &str) -> String {
    let mut prefix = std::fs::canonicalize(prefix)
        .unwrap()
        .to_str()
        .unwrap()
        .to_owned();
    if prefix.ends_with("/") {
        prefix.truncate(prefix.len() - 1);
    }
    return prefix;
}

fn read_rhythmdb(rhythmdb_file: &str, library_location_prefix: &str) -> Library {
    let input_file = File::open(rhythmdb_file).expect("rhythmdb file not found");

    let mut reader = BufReader::new(input_file);

    // Skip the first two lines
    let mut line = String::new();
    reader.read_line(&mut line).unwrap();
    reader.read_line(&mut line).unwrap();

    let mut library = Library {
        songs: HashMap::new(),
    };
    loop {
        match read_song(&mut reader, &library_location_prefix) {
            Some(song) => {
                let mut song = song.clone();
                song.id = library.songs.len() as u32;
                library.songs.insert(song.id, song);
            }
            None => break,
        }
    }

    return library;
}

fn read_song(input_file: &mut BufReader<File>, library_location_prefix: &str) -> Option<Song> {
    let mut element = read_element(input_file);
    while !element.eq(&Element::Entry) {
        if element.eq(&Element::EOF) {
            return Option::None;
        }
        element = read_element(input_file);
    }

    let mut song = Song {
        id: 0,
        title: String::new(),
        genre: String::new(),
        artist: String::new(),
        album: String::new(),
        duration: 0,
        rating: 0,
        file_location: String::new(),
    };

    while !element.eq(&Element::CloseEntry) && !element.eq(&Element::EOF) {
        match element {
            Element::Title(title) => {
                song.title = decode(&title);
            }
            Element::Genre(genre) => {
                song.genre = decode(&genre);
            }
            Element::Artist(artist) => {
                song.artist = decode(&artist);
            }
            Element::Album(album) => {
                song.album = decode(&album);
            }
            Element::Duration(duration) => song.duration = duration,
            Element::Rating(rating) => {
                song.rating = rating;
            }
            Element::Location(location) => {
                let prefix = format!("file://{}", library_location_prefix);
                if !location.starts_with(&prefix) {
                    panic!("location {} does not start with {}", location, prefix);
                }
                song.file_location = decode(&location[prefix.len()..].to_string());
            }
            _ => {
                // skip
            }
        }
        element = read_element(input_file);
    }

    if element.eq(&Element::EOF) {
        return Option::None;
    } else {
        return Option::Some(song);
    }
}

fn decode(value: &str) -> String {
    let value = percent_decode(value.as_bytes())
        .decode_utf8()
        .unwrap()
        .to_string();
    return decode_html(&value).unwrap();
}

fn read_element(input_file: &mut BufReader<File>) -> Element {
    let mut line = String::new();
    if input_file.read_line(&mut line).unwrap() == 0 {
        return Element::EOF;
    }
    let line = line.trim();
    if line.eq("<entry type=\"song\">") {
        return Element::Entry;
    }
    if line.eq("</entry>") {
        return Element::CloseEntry;
    }
    if line.starts_with("<title>") && line.ends_with("</title>") {
        return Element::Title(line[7..line.len() - 8].to_string());
    }
    if line.starts_with("<genre>") && line.ends_with("</genre>") {
        return Element::Genre(line[7..line.len() - 8].to_string());
    }
    if line.starts_with("<artist>") && line.ends_with("</artist>") {
        return Element::Artist(line[8..line.len() - 9].to_string());
    }
    if line.starts_with("<album>") && line.ends_with("</album>") {
        return Element::Album(line[7..line.len() - 8].to_string());
    }
    if line.starts_with("<duration>") && line.ends_with("</duration>") {
        let contents = &line[10..line.len() - 11];
        if contents.len() == 0 {
            return Element::Duration(0);
        } else {
            return Element::Duration(contents.parse::<u32>().unwrap());
        }
    }
    if line.starts_with("<rating>") && line.ends_with("</rating>") {
        let contents = &line[8..line.len() - 9];
        if contents.len() == 0 {
            return Element::Rating(0);
        } else {
            return Element::Rating(contents.parse::<u32>().unwrap());
        }
    }
    if line.starts_with("<location>") && line.ends_with("</location>") {
        return Element::Location(line[10..line.len() - 11].to_string());
    }
    return Element::Unknown;
}

struct LibraryHash {
    // Map from song titles to a list of songs with that title
    songs: HashMap<String, Vec<Song>>,
}

impl LibraryHash {
    fn new(library: &Library) -> LibraryHash {
        let mut songs: HashMap<String, Vec<Song>> = HashMap::new();
        for song in library.songs.values() {
            match songs.get_mut(&song.title) {
                Some(v) => {
                    v.push(song.clone());
                }
                None => {
                    songs.insert(song.title.clone(), vec![song.clone()]);
                }
            }
        }

        return LibraryHash { songs };
    }

    fn lookup(&self, target: &Song) -> Option<Song> {
        match self.songs.get(&target.title) {
            Some(songs) => {
                for song in songs {
                    if song.artist.eq(&target.artist)
                        && song.album.eq(&target.album)
                        && song.duration.eq(&target.duration)
                    {
                        return Some(song.clone());
                    }
                }
                None
            }
            None => None,
        }
    }
}
