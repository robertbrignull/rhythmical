#![feature(proc_macro_hygiene, decl_macro, custom_attribute, plugin)]

#![plugin(rocket_codegen)]
extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
#[macro_use] extern crate serde_derive;
extern crate serde_json;
#[macro_use] extern crate lazy_static;

mod library;
mod server;
mod api;
mod args;
mod gsutil;

use args::{Args, Mode};
use server::start_server;

fn main() {
    match Args::get_mode() {
        Mode::Serve => {
            start_server();
        }
        Mode::ParseRhythmDb => {
            // do nothing
        }
    }
}
