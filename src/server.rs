extern crate rocket;

use std::env;
use std::fs::File;
use std::io::Read;
use rocket::{response::content};

use api::get_api_routes;

#[get("/")]
fn root() -> content::Html<String> {
    let current_dir = env::current_dir().unwrap();
    let index_html_path = current_dir.join("frontend/public/index.html");
    let mut index_html = File::open(index_html_path).unwrap();
    let mut index_html_contents = String::new();
    index_html.read_to_string(&mut index_html_contents).unwrap();
    return content::Html(index_html_contents);
}

#[get("/app.js")]
fn app_js() -> content::JavaScript<String> {
    let mut out_js = File::open(concat!(env!("OUT_DIR"), "/app.js")).unwrap();
    let mut out_js_contents = String::new();
    out_js.read_to_string(&mut out_js_contents).unwrap();
    return content::JavaScript(out_js_contents);
}

pub fn start_server() {
    rocket::ignite()
        .mount("/", routes![root, app_js])
        .mount("/api", get_api_routes())
        .launch();
}
