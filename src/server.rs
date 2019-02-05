extern crate rouille;

use std::env;
use std::fs::File;
use std::io::Read;
use rouille::{Request, Response};

use api::route_api;

fn root() -> Response {
    let current_dir = env::current_dir().unwrap();
    let index_html_path = current_dir.join("frontend/public/index.html");
    let mut index_html = File::open(index_html_path).unwrap();
    let mut index_html_contents = String::new();
    index_html.read_to_string(&mut index_html_contents).unwrap();
    return Response::html(index_html_contents);
}

fn app_js() -> Response {
    let mut out_js = File::open(concat!(env!("OUT_DIR"), "/app.js")).unwrap();
    let mut out_js_contents = String::new();
    out_js.read_to_string(&mut out_js_contents).unwrap();
    return Response::from_data(
        "application/javascript",
        out_js_contents);
}

fn route(request: &Request) -> Response {
    if request.url().eq("/") {
        return root();
    }

    if request.url().eq("/app.js") {
        return app_js();
    }

    if request.url().starts_with("/api") {
        return route_api(request);
    }

    return Response::empty_404();
}

pub fn start_server() {
    let address = "localhost:8000";
    println!("Serving at {}", address);
    rouille::start_server(address, route);
}
