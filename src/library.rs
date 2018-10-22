#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone)]
pub struct Song {
    pub name: String,
    pub file_location: String,
}

#[derive(PartialOrd, PartialEq, Ord, Eq, Hash, Clone)]
pub struct Library {
    pub songs: Vec<Song>,
}

pub fn load_library() -> Library {
    let mut songs: Vec<Song> = Vec::new();

    songs.push(Song {
        name: "Hump de Bump".to_string(),
        file_location: "/home/robert/Music/Red Hot Chili Peppers/Stadium Arcadium/Hump de Bump.mp3".to_string(),
    });

    songs.push(Song {
        name: "Ojos Asi".to_string(),
        file_location: "/home/robert/Music/Facebook-TodoenMP3/Donde Estan Los Ladrones (Russian Edition)/11 - Ojos Asi.mp3".to_string(),
    });

    songs.push(Song {
        name: "Dont You Worry Bout A Thing".to_string(),
        file_location: "/home/robert/Music/Stevie Wonder/Live at Last/Dont You Worry Bout A Thing.mp3".to_string(),
    });

    return Library {
        songs
    }
}
