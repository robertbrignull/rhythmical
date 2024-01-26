use std::io::{Error, ErrorKind, Result};
use std::path::Path;
use std::process::Command;

pub fn ls(project_name: &str, mut path: &str) -> Result<Vec<String>> {
    if path.ends_with("/") {
        path = &path[0..path.len() - 1];
    }

    let mut cmd = Command::new("gsutil");
    cmd.arg("ls")
        .arg("-R")
        .arg(format!("gs://{}{}", project_name, path));

    return match String::from_utf8(execute(cmd)?) {
        Ok(output) => {
            let mut paths: Vec<String> = Vec::new();
            let prefix = format!("gs://{}{}", project_name, path);
            for line in output.lines() {
                if line.starts_with(&prefix) && !line.ends_with("/:") {
                    paths.push(line[prefix.len()..].to_string());
                }
            }
            return Ok(paths);
        }
        Err(err) => Result::Err(Error::new(
            ErrorKind::Other,
            format!("Error decoding output: {}", err),
        )),
    };
}

pub fn cat(project_name: &str, path: &str) -> Result<Vec<u8>> {
    let mut cmd = Command::new("gsutil");
    cmd.arg("cat").arg(format!("gs://{}{}", project_name, path));
    return execute(cmd);
}

pub fn sign(project_name: &str, path: &str, private_key: &str) -> Result<String> {
    let mut cmd = Command::new("gsutil");
    cmd.arg("signurl")
        .arg("-d")
        .arg("60m")
        .arg(private_key)
        .arg(format!("gs://{}{}", project_name, path));

    return match String::from_utf8(execute(cmd)?) {
        Ok(output) => {
            return match output.find("https://storage.googleapis.com") {
                Some(i) => Result::Ok(output.get(i..).unwrap().to_string()),
                None => Result::Err(Error::new(
                    ErrorKind::Other,
                    format!("gsutil signurl output did not contain url: {}", output),
                )),
            };
        }
        Err(err) => Result::Err(Error::new(
            ErrorKind::Other,
            format!("Error decoding output: {}", err),
        )),
    };
}

pub fn upload(project_name: &str, local_source_path: &str, remote_dest_path: &str) -> Result<()> {
    // Copy the local file to a temp location which doesn't contain any special characters.
    let temp_file = "/tmp/rhythmical_temp_upload";
    if Path::new(temp_file).exists() {
        std::fs::remove_file(temp_file)?;
    }
    std::fs::copy(local_source_path, temp_file)?;

    let mut cmd = Command::new("gsutil");
    cmd.arg("cp")
        .arg(temp_file)
        .arg(format!("gs://{}{}", project_name, remote_dest_path));
    execute(cmd)?;

    std::fs::remove_file(temp_file)?;

    return Result::Ok(());
}

pub fn cp(project_name: &str, src_path: &str, dest_path: &str) -> Result<()> {
    let mut cmd = Command::new("gsutil");
    cmd.arg("cp")
        .arg(format!("gs://{}{}", project_name, src_path))
        .arg(format!("gs://{}{}", project_name, dest_path));
    execute(cmd)?;
    return Result::Ok(());
}

pub fn rm(project_name: &str, path: &str) -> Result<()> {
    let mut cmd = Command::new("gsutil");
    cmd.arg("rm").arg(format!("gs://{}{}", project_name, path));
    execute(cmd)?;
    return Result::Ok(());
}

fn execute(mut cmd: Command) -> Result<Vec<u8>> {
    return match cmd.output() {
        Ok(output) => {
            if !output.status.success() {
                println!("stdout:\n{}", String::from_utf8(output.stdout).unwrap());
                println!("stderr:\n{}", String::from_utf8(output.stderr).unwrap());
                return Result::Err(Error::new(
                    ErrorKind::Other,
                    format!("gsutil outputted {}", output.status.code().unwrap_or(-1)),
                ));
            }
            return Result::Ok(output.stdout);
        }
        Err(err) => Result::Err(Error::new(
            ErrorKind::Other,
            format!("Error running {:?}: {}", cmd, err),
        )),
    };
}
