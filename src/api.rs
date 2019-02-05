extern crate serde;
extern crate serde_derive;
extern crate serde_json;
extern crate lazy_static;
extern crate regex;

use rouille::{Request, Response};
use regex::Regex;

use library::Library;
use gsutil;

lazy_static! {
    static ref SONG_CONTENTS_REGEX: Regex =
       Regex::new(r"/api/songs/(\d+)/contents").unwrap();
}

#[derive(Serialize)]
struct ApiSong {
    id: u32,
    title: String,
    genre: String,
    artist: String,
    album: String,
    duration: u32,
    rating: u32,
}

fn songs() -> Response {
    let mut songs: Vec<ApiSong> = Vec::new();
    for song in Library::get().songs.values() {
        songs.push(ApiSong {
            id: song.id,
            title: song.title.clone(),
            genre: song.genre.clone(),
            artist: song.artist.clone(),
            album: song.album.clone(),
            duration: song.duration,
            rating: song.rating,
        });
    }
    return Response::json(&songs);
}

fn song_contents(id: u32) -> Response {
    return match Library::get().songs.get(&id) {
        Some(song) => {
            let signed_url = gsutil::sign(&format!("/Music{}", song.file_location));
            return Response::text(signed_url);
        },
        None => Response::empty_404()
    };
}

pub fn route_api(request: &Request) -> Response {
    if request.url().eq("/api/songs")  {
        return songs();
    }

    let url = request.url();
    let cap = SONG_CONTENTS_REGEX.captures(url.as_str());
    if cap.is_some() {
        let id = cap.unwrap()[1].parse::<u32>();
        if id.is_ok() {
            return song_contents(id.unwrap());
        }
    }

    return Response::empty_404();
}
