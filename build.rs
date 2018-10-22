use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    let current_dir = env::current_dir().unwrap();
    let out_dir = env::var("OUT_DIR").unwrap();
    println!("{:?},  {}", current_dir, out_dir);

    Command::new("tsc")
        .arg("--project")
        .arg(current_dir.join("frontend/tsconfig.json"))
        .arg("--outFile")
        .arg(Path::new(&out_dir).join("app.js"))
        .output()
        .expect("Fails to execute tsc");
}
