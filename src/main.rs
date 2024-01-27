#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate rouille;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate azure_core;
extern crate azure_storage;
extern crate azure_storage_blobs;
extern crate futures;
extern crate htmlescape;
extern crate percent_encoding;
extern crate rand;
extern crate regex;
extern crate serde_json;
extern crate tokio;
extern crate time;

mod api;
mod args;
mod library;
mod server;
mod storage;
mod sync_rhythmdb;
mod validate_library;

use args::{Args, Mode};
use library::Library;
use server::start_server;
use sync_rhythmdb::sync_rhythmdb;
use validate_library::validate_library;

use crate::storage::sign;

fn main() {
    let args = Args::get();
    match args.mode {
        Mode::Serve => {
            start_server();
        }
        Mode::SyncRhythmdb => {
            sync_rhythmdb(args.sync_rhythmdb.unwrap());
        }
        Mode::ValidateLibrary => {
            validate_library(args.validate_library.unwrap());
        }
        Mode::TestAzure => {
            let library = Library::new();
            let song = library.songs.values().next().unwrap();
            println!("{}", song.file_location);

            println!("{}", sign(&format!("Music{}", song.file_location)).expect("Unable to sign url"));
        }
    }
}
