extern crate walkdir;

use std::env;
use std::fs::metadata;
use std::io::Result;
use std::path::Path;
use std::process::{Command, ExitStatus};

use walkdir::WalkDir;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();

    env::set_current_dir("frontend").unwrap();

    if should_run_npm().unwrap() {
        println!("Running 'npm install'");
        assert_success(
            "npm install",
            Command::new("npm").arg("install").status().unwrap(),
        );
    } else {
        println!("Skipping running 'npm install'");
    }

    if should_run_webpack(&out_dir).unwrap() {
        println!("Running 'webpack'");
        assert_success(
            "rm app.js",
            Command::new("rm")
                .arg("-f")
                .arg(Path::new(&out_dir).join("app.js"))
                .status()
                .unwrap(),
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
    } else {
        println!("Skipping running 'webpack'");
    }
}

fn assert_success(command_name: &str, status: ExitStatus) {
    match status.code() {
        Some(code) => {
            if code != 0 {
                panic!("Command {} fexited with status code {}", command_name, code);
            }
        }
        None => {
            panic!("Command {} terminated by signal", command_name);
        }
    }
}

fn should_run_npm() -> Result<bool> {
    let package_json_modified = metadata(Path::new("package.json"))?.modified()?;
    let package_lock_modified = metadata(Path::new("package-lock.json"))?.modified()?;

    if !Path::new("node_modules").exists() {
        return Result::Ok(true);
    }
    let node_modules_modified = metadata(Path::new("node_modules"))?.modified()?;

    return Result::Ok(
        package_json_modified > node_modules_modified
            || package_lock_modified > node_modules_modified,
    );
}

fn should_run_webpack(out_dir: &str) -> Result<bool> {
    let output_file = Path::new(&out_dir).join("app.js");
    if !output_file.exists() {
        println!("Output 'app.js' file does not exist");
        return Result::Ok(true);
    }
    let output_file_modified = metadata(output_file)?.modified()?;

    let mut inputs_modified = output_file_modified;
    let mut it = WalkDir::new(".").into_iter();
    loop {
        let entry = match it.next() {
            None => break,
            Some(Err(err)) => panic!("Error walking files: {}", err),
            Some(Ok(entry)) => entry,
        };
        if entry.file_name() == "node_modules" {
            it.skip_current_dir();
        }
        if entry.file_type().is_file() {
            let m = metadata(entry.path())?.modified()?;
            if inputs_modified < m {
                inputs_modified = m;
            }
        }
    }

    return Result::Ok(inputs_modified > output_file_modified);
}
