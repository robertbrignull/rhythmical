extern crate serde;
extern crate serde_derive;
extern crate serde_json;
extern crate regex;

use rouille::{Request, Response};
use regex::Regex;

use args::ServeArgs;
use library::Library;
use gsutil;

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

pub struct Api {
    project_name: String,
    private_key: String,
    library: Library,
    songs_contents_regex: Regex,
}

impl Api {
    pub fn new(args: ServeArgs) -> Api {
        return Api {
            project_name: args.project_name.clone(),
            private_key: args.private_key.clone(),
            library: Library::new(&args.project_name),
            songs_contents_regex: Regex::new(r"/api/songs/(\d+)/contents").unwrap(),
        };
    }

    fn songs(&self) -> Response {
        let mut songs: Vec<ApiSong> = Vec::new();
        for song in self.library.songs.values() {
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

    fn song_contents(&self, id: u32) -> Response {
        return match self.library.songs.get(&id) {
            Some(song) => {
                Response::text(gsutil::sign(&self.project_name, &format!("/Music{}", song.file_location), &self.private_key))
            },
            None => {
                Response::text(format!("Song with id {} not found", id)).with_status_code(404)
            }
        };
    }

    pub fn route_api(&self, request: &Request) -> Response {
        if request.url().eq("/api/songs")  {
            return self.songs();
        }

        let url = request.url();
        return match self.songs_contents_regex.captures(url.as_str()) {
            Some(cap) => {
                match cap[1].parse::<u32>() {
                    Ok(id) => self.song_contents(id),
                    Err(_) => Response::text("Song id is not an integer").with_status_code(400)
                }
            },
            None => Response::empty_404()
        }
    }
}
