extern crate serde_json;
extern crate lazy_static;

use std::collections::HashMap;

use gsutil;

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone, Serialize, Deserialize)]
pub struct Song {
    pub id: u32,
    pub title: String,
    pub file_location: String,
}

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub songs: HashMap<u32, Song>,
}

lazy_static! {
    static ref LIBRARY: Library = {
        let data = gsutil::cat(&"/library.json".to_string());
        match serde_json::from_slice(&data) {
            Ok(library) => library,
            Err(error) => panic!("Unable to parse library: {}", error)
        }
    };
}

impl Library {
    pub fn get() -> &'static Library {
        return &LIBRARY;
    }
}
