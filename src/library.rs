extern crate lazy_static;
extern crate rand;
extern crate regex;
extern crate serde_json;

use std::collections::HashMap;
use std::io::Result;

use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use regex::Regex;

use gsutil;

lazy_static! {
    static ref INVALID_CHARACTERS_REGEX: Regex = Regex::new(r"[^0-9a-zA-Z]+").unwrap();
}

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone, Serialize, Deserialize, Debug)]
pub struct Song {
    pub id: u32,
    pub title: String,
    pub genre: String,
    pub artist: String,
    pub album: String,
    pub duration: u32,
    pub rating: u32,
    pub file_location: String,
}

impl Song {
    pub fn generate_file_location(&self) -> String {
        let prefix = self.file_prefix();
        let random_suffix: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();
        let current_extension = self.file_extension();
        return format!("/{}{}{}", prefix, random_suffix, current_extension);
    }

    pub fn has_valid_file_location(&self) -> bool {
        let prefix = format!("/{}", self.file_prefix());
        return self.file_location.starts_with(&prefix);
    }

    fn file_prefix(&self) -> String {
        let prefix = format!("{}-{}-{}-", self.artist, self.album, self.title);
        return INVALID_CHARACTERS_REGEX
            .replace_all(&prefix, "-")
            .to_string();
    }

    fn file_extension(&self) -> String {
        return match self.file_location.rfind('.') {
            Some(last_dot_index) => self.file_location[last_dot_index..].to_string(),
            None => "".to_string(),
        };
    }
}

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub songs: HashMap<u32, Song>,
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

    pub fn serialize(&self, output_file: &str) -> Result<()> {
        let data = serde_json::to_string(self)?;
        std::fs::write(output_file, data)?;
        return Result::Ok(());
    }

    pub fn combine_libraries(matched_songs: &Vec<(Song, Song)>, new_songs: &Vec<Song>) -> Library {
        let mut songs: HashMap<u32, Song> = HashMap::new();

        for (source_song, dest_song) in matched_songs {
            let id = songs.len() as u32;
            songs.insert(
                id,
                Song {
                    id,
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
            let id = songs.len() as u32;
            let mut song = song.clone();
            song.id = id;
            songs.insert(id, song);
        }

        return Library { songs };
    }
}
