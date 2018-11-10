extern crate serde_json;
extern crate percent_encoding;

use std::fs::File;
use std::io::Write;
use std::io::BufReader;
use std::io::BufRead;
use percent_encoding::percent_decode;
use std::collections::HashMap;

use args::ParseRhythmDbArgs;
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

const LOCATION_PREFIX: &str = "file:///home/robert/Music";

pub fn parse_rhythm_db() {
    let args = ParseRhythmDbArgs::get();

    let input_file = File::open(args.input_file)
        .expect("Input file not found");
    let mut output_file = File::create(args.output_file)
        .expect("Output file could not be created");

    let mut reader = BufReader::new(input_file);

    // Skip the first two lines
    let mut line = String::new();
    reader.read_line(&mut line).unwrap();
    reader.read_line(&mut line).unwrap();

    let mut library = Library {
        songs: HashMap::new(),
    };
    loop {
        match read_song(&mut reader) {
            Some(song) => {
                let mut song = song.clone();
                song.id = library.songs.len() as u32;
                library.songs.insert(song.id,song);
            },
            None => break
        }
    }

    let data = serde_json::to_string_pretty(&library).unwrap();
    output_file.write_all(data.as_bytes())
        .expect("Unable to write to output file");
}

fn read_song(input_file: &mut BufReader<File>) -> Option<Song> {
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
                song.title = title.clone();
            },
            Element::Genre(genre) => {
                song.genre = genre.clone();
            },
            Element::Artist(artist) => {
                song.artist = artist.clone();
            },
            Element::Album(album) => {
                song.album = album.clone();
            },
            Element::Duration(duration) => {
                song.duration = duration
            },
            Element::Rating(rating) => {
                song.rating = rating;
            },
            Element::Location(location) => {
                if !location.starts_with(LOCATION_PREFIX) {
                    panic!(format!("location {} does not start with file:///home/robert/Music", location));
                }
                let location_bytes = &location[LOCATION_PREFIX.len()..].as_bytes();
                song.file_location = percent_decode(location_bytes)
                    .decode_utf8().unwrap().to_string();
            },
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

fn read_element(input_file: &mut BufReader<File>) -> Element {
    let mut line = String::new();
    if input_file.read_line(&mut line).unwrap() == 0 {
        return Element::EOF;
    }
    if line.eq("  <entry type=\"song\">\n") {
        return Element::Entry;
    }
    if line.eq("  </entry>\n") {
        return Element::CloseEntry;
    }
    if line.starts_with("    <title>") && line.ends_with("</title>\n") {
        return Element::Title(line[11..line.len()-9].to_string());
    }
    if line.starts_with("    <genre>") && line.ends_with("</genre>\n") {
        return Element::Genre(line[11..line.len()-9].to_string());
    }
    if line.starts_with("    <artist>") && line.ends_with("</artist>\n") {
        return Element::Artist(line[12..line.len()-10].to_string());
    }
    if line.starts_with("    <album>") && line.ends_with("</album>\n") {
        return Element::Album(line[11..line.len()-9].to_string());
    }
    if line.starts_with("    <duration>") && line.ends_with("</duration>\n") {
        let contents = &line[14..line.len()-12];
        if contents.len() == 0 {
            return Element::Duration(0);
        } else {
            return Element::Duration(contents.parse::<u32>().unwrap());
        }
    }
    if line.starts_with("    <rating>") && line.ends_with("</rating>\n") {
        let contents = &line[12..line.len()-10];
        if contents.len() == 0 {
            return Element::Rating(0);
        } else {
            return Element::Rating(contents.parse::<u32>().unwrap());
        }
    }
    if line.starts_with("    <location>") && line.ends_with("</location>\n") {
        return Element::Location(line[14..line.len()-12].to_string());
    }
    return Element::Unknown;
}
