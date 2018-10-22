extern crate rocket;

use std::fs::File;
use std::io::Read;

#[get("/")]
fn root() -> String {
    return format!("Hello, world!")
}

#[get("/app.js")]
fn app_js() -> String {
    let mut out_js = File::open(concat!(env!("OUT_DIR"), "/app.js")).unwrap();
    let mut out_js_contents = String::new();
    out_js.read_to_string(&mut out_js_contents).unwrap();
    return out_js_contents;
}

pub fn start_server() {
    rocket::ignite()
        .mount("/", routes![root, app_js])
        .launch();
}
