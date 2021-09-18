use std::env;
use std::path::Path;
use std::process::{Command, ExitStatus};

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();

    env::set_current_dir("frontend").unwrap();

    assert_success(
        "npm ci",
        Command::new("npm").arg("ci").status().unwrap(),
    );

    assert_success(
        "webpack",
        Command::new("./node_modules/.bin/webpack")
            .arg("--output-filename")
            .arg("app.js")
            .arg("--output-path")
            .arg(Path::new(&out_dir))
            .status()
            .unwrap(),
    );
}

fn assert_success(command_name: &str, status: ExitStatus) {
    match status.code() {
        Some(code) => {
            if code != 0 {
                panic!("Command {} exited with status code {}", command_name, code);
            }
        }
        None => {
            panic!("Command {} terminated by signal", command_name);
        }
    }
}
