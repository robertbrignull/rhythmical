extern crate lazy_static;
extern crate rand;
extern crate regex;
extern crate serde_json;

use std::collections::HashMap;
use std::io::Result;
use std::path::Path;

use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use regex::Regex;

use gsutil;

lazy_static! {
    static ref INVALID_CHARACTERS_REGEX: Regex = Regex::new(r"[^0-9a-zA-Z]+").unwrap();
    static ref DOUBLE_DASHES_REGEX: Regex = Regex::new(r"-+").unwrap();
}

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone, Serialize, Deserialize, Debug)]
pub struct Song {
    pub id: String,
    pub title: String,
    pub genre: String,
    pub artist: String,
    pub album: String,
    pub duration: u32,
    pub rating: u32,
    pub file_location: String,
}

impl Song {
    pub fn correct_file_location(&self) -> String {
        let prefix = format!("{}-{}-{}-{}", self.artist, self.album, self.title, self.id);
        let prefix = INVALID_CHARACTERS_REGEX
            .replace_all(&prefix, "-")
            .to_string();
        let prefix = DOUBLE_DASHES_REGEX.replace_all(&prefix, "-").to_string();

        let current_extension = match self.file_location.rfind('.') {
            Some(last_dot_index) => self.file_location[last_dot_index..].to_string(),
            None => "".to_string(),
        };

        return format!("/{}{}", prefix, current_extension);
    }

    pub fn has_correct_file_location(&self) -> bool {
        return self.file_location.eq(&self.correct_file_location());
    }
}

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub songs: HashMap<String, Song>,
}

impl Library {
    pub fn new(project_name: &str) -> Library {
        return match gsutil::cat(project_name, &"/library.json".to_string()) {
            Ok(data) => match serde_json::from_slice(&data) {
                Ok(library) => library,
                Err(error) => panic!("Unable to parse library: {}", error),
            },
            Err(error) => panic!("Unable to load library: {}", error),
        };
    }

    pub fn save(&self, project_name: &str) -> Result<()> {
        let temp_file = "/tmp/new_library.json";
        if Path::new(temp_file).exists() {
            std::fs::remove_file(temp_file)?;
        }
        self.serialize(&temp_file)
            .expect("Unable to serialize library");
        gsutil::upload(project_name, &temp_file.to_string(), "/library.json")?;
        std::fs::remove_file(temp_file)?;
        return Result::Ok(());
    }

    pub fn serialize(&self, output_file: &str) -> Result<()> {
        let data = serde_json::to_string(self)?;
        std::fs::write(output_file, data)?;
        return Result::Ok(());
    }

    pub fn combine_libraries(matched_songs: &Vec<(Song, Song)>, new_songs: &Vec<Song>) -> Library {
        let mut songs: HashMap<String, Song> = HashMap::new();

        // source_song is from the local library being uploaded
        // dest_song is from the existing cloud library
        for (source_song, dest_song) in matched_songs {
            songs.insert(
                dest_song.id.clone(),
                Song {
                    id: dest_song.id.clone(),
                    title: dest_song.title.clone(),
                    genre: source_song.genre.clone(),
                    artist: dest_song.artist.clone(),
                    album: dest_song.album.clone(),
                    duration: dest_song.duration,
                    rating: source_song.rating,
                    file_location: dest_song.file_location.clone(),
                },
            );
        }

        for song in new_songs {
            let mut new_song = song.clone();
            if songs.contains_key(&song.id) {
                let new_id = new_song_id(&songs);
                new_song.id = new_id;
            }
            songs.insert(new_song.id.clone(), new_song);
        }

        return Library { songs };
    }

    pub fn new_song_id(&self) -> String {
        return new_song_id(&self.songs);
    }
}

fn new_song_id(songs: &HashMap<String, Song>) -> String {
    loop {
        let id: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();
        if !songs.contains_key(&id) {
            return id;
        }
    }
}
