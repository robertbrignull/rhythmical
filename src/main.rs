#![feature(proc_macro_hygiene, decl_macro, custom_attribute, plugin)]


#[macro_use] extern crate rouille;
extern crate serde;
#[macro_use] extern crate serde_derive;
extern crate serde_json;
#[macro_use] extern crate lazy_static;
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
    match Args::get_mode() {
        Mode::Serve => {
            start_server();
        }
        Mode::ParseRhythmDb => {
            parse_rhythm_db();
        }
    }
}
