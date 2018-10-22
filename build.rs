use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();

    env::set_current_dir("frontend").unwrap();

    Command::new("./node_modules/.bin/webpack")
        .arg("--output-filename")
        .arg("app.js")
        .arg("--output-path")
        .arg(Path::new(&out_dir))
        .output()
        .unwrap();
}
