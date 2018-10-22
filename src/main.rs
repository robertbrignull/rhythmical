#![feature(proc_macro_hygiene, decl_macro, custom_attribute, plugin)]

#![plugin(rocket_codegen)]
extern crate rocket;

mod library;
mod server;

use library::load_library;
use server::start_server;

fn main() {
    for song in load_library().songs {
        println!("{}", song.name);
    }

    start_server();
}
