use std::process::Command;

use args::Args;

pub fn cat(path: &String) -> Vec<u8> {
    let project_name = &Args::get().project_name;
    let mut cmd = Command::new("gsutil");
    cmd.arg("cat");
    cmd.arg(format!("gs://{}{}", project_name, path));
    return cmd.output().unwrap().stdout;
}

pub fn sign(path: &String) -> String {
    let args = Args::get();
    let mut cmd = Command::new("gsutil");
    cmd.arg("signurl")
        .arg("-d").arg("60m")
        .arg(&args.private_key)
        .arg(format!("gs://{}{}", args.project_name, path));

    let output = String::from_utf8(cmd.output().unwrap().stdout).unwrap();

    return match output.find("https://storage.googleapis.com") {
        Some(i) => output.get(i..).unwrap().to_string(),
        None => panic!(format!("gsutil signurl output did not contain url: {}", output))
    };
}
