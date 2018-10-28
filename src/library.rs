extern crate serde_json;
extern crate lazy_static;

use std::collections::HashMap;
use std::fs::File;
use std::io::Read;

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone, Serialize, Deserialize)]
pub struct Song {
    pub id: u32,
    pub name: String,
    pub file_location: String,
}

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub songs: HashMap<u32, Song>,
}

lazy_static! {
    static ref LIBRARY: Library = {
        let mut file = File::open("/home/robert/Documents/coding/mine/rust/rhythmical/library.json").unwrap();
        let mut data = String::new();
        file.read_to_string(&mut data).unwrap();

        match serde_json::from_str(&data) {
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
