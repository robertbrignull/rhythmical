#[macro_use] extern crate rouille;
extern crate serde;
#[macro_use] extern crate serde_derive;
extern crate serde_json;
extern crate percent_encoding;
extern crate htmlescape;
extern crate regex;

mod library;
mod server;
mod api;
mod args;
mod gsutil;
mod parse_rhythm_db;

use args::{Args, Mode};
use server::start_server;
use parse_rhythm_db::parse_rhythm_db;

fn main() {
    let args = Args::get();
    match args.mode {
        Mode::Serve => {
            start_server(args.serve.unwrap());
        }
        Mode::ParseRhythmDb => {
            parse_rhythm_db(args.parse_rhythm_db.unwrap());
        }
    }
}
