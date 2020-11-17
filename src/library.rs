extern crate serde_json;

use std::collections::HashMap;

use gsutil;

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone, Serialize, Deserialize)]
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
            Err(error) => panic!("Unable to parse library: {}", error)
        };
    }
}
