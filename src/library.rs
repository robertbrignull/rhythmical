use std::collections::HashMap;

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone)]
pub struct Song {
    pub id: u32,
    pub name: String,
    pub file_location: String,
}

pub struct Library {
    pub songs: HashMap<u32, Song>,
}

pub fn load_library() -> Library {
    let mut songs: HashMap<u32, Song> = HashMap::new();

    songs.insert(1, Song {
        id: 1,
        name: "Hump de Bump".to_string(),
        file_location: "/home/robert/Music/Red Hot Chili Peppers/Stadium Arcadium/Hump de Bump.mp3".to_string(),
    });

    songs.insert(2, Song {
        id: 2,
        name: "Ojos Asi".to_string(),
        file_location: "/home/robert/Music/Facebook-TodoenMP3/Donde Estan Los Ladrones (Russian Edition)/11 - Ojos Asi.mp3".to_string(),
    });

    songs.insert(3, Song {
        id: 3,
        name: "Dont You Worry Bout A Thing".to_string(),
        file_location: "/home/robert/Music/Stevie Wonder/Live at Last/Dont You Worry Bout A Thing.mp3".to_string(),
    });

    return Library {
        songs
    }
}
