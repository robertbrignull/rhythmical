use std::process::Command;

use args::Args;

pub fn cat(path: &String) -> Vec<u8> {
    let project_name = &Args::get().project_name;
    let mut cmd = Command::new("gsutil");
    cmd.arg("cat");
    cmd.arg(format!("gs://{}{}", project_name, path));
    return cmd.output().unwrap().stdout;
}
