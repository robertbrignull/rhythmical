extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
extern crate serde_derive;
extern crate serde_json;

use std::io::Read;
use std::path::Path;
use std::fs::File;
use rocket::Route;
use rocket_contrib::Json;

use library::Library;

#[derive(Serialize)]
struct ApiSong {
    id: u32,
    name: String,
}

#[get("/songs")]
fn songs() -> Json<Vec<ApiSong>> {
    let mut songs: Vec<ApiSong> = Vec::new();
    for song in Library::get().songs.values() {
        songs.push(ApiSong {
            id: song.id,
            name: song.name.clone(),
        });
    }
    return Json(songs);
}

#[get("/songs/<id>/contents")]
fn song_contents(id: u32) -> Option<Vec<u8>> {
    return Library::get().songs.get(&id).map(|song| {
        let mut song_file = File::open(Path::new(&song.file_location)).unwrap();
        let mut contents: Vec<u8> = Vec::new();
        song_file.read_to_end(&mut contents).unwrap();
        return contents;
    });
}

pub fn get_api_routes() -> Vec<Route> {
    return routes![songs, song_contents];
}
