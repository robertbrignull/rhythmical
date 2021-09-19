extern crate lazy_static;
extern crate rand;
extern crate regex;
extern crate serde_json;

use std::collections::HashMap;

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
        let random_suffix: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();

        let mut file_location = format!(
            "{}-{}-{}-{}",
            self.artist, self.album, self.title, random_suffix
        );

        file_location = INVALID_CHARACTERS_REGEX
            .replace_all(&file_location, "-")
            .to_string();

        let current_extension = self.file_extension();
        return format!("{}{}", file_location, current_extension);
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
        let data = gsutil::cat(project_name, &"/library.json".to_string());
        return match serde_json::from_slice(&data) {
            Ok(library) => library,
            Err(error) => panic!("Unable to parse library: {}", error),
        };
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
