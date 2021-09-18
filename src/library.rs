extern crate serde_json;

use std::collections::HashMap;

use gsutil;

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

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub songs: HashMap<u32, Song>,
}

impl Library {
    pub fn new(project_name: &String) -> Library {
        let data = gsutil::cat(project_name, &"/library.json".to_string());
        return match serde_json::from_slice(&data) {
            Ok(library) => library,
            Err(error) => panic!("Unable to parse library: {}", error),
        };
    }

    pub fn combine_libraries(matched_songs: Vec<(Song, Song)>, new_songs: Vec<Song>) -> Library {
        let mut songs: HashMap<u32, Song> = HashMap::new();

        for (source_song, dest_song) in matched_songs {
            let id = songs.len() as u32;
            songs.insert(
                id,
                Song {
                    id,
                    title: dest_song.title,
                    genre: source_song.genre,
                    artist: dest_song.artist,
                    album: dest_song.album,
                    duration: dest_song.duration,
                    rating: source_song.rating,
                    file_location: dest_song.file_location,
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
