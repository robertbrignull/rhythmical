extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
extern crate serde_derive;
extern crate serde_json;

use rocket::Route;
use rocket_contrib::Json;

use library::Library;
use gsutil;

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
        return gsutil::cat(&format!("/Music{}", song.file_location));
    });
}

pub fn get_api_routes() -> Vec<Route> {
    return routes![songs, song_contents];
}
