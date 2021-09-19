use std::process::Command;

pub fn cat(project_name: &str, path: &str) -> Vec<u8> {
    let mut cmd = Command::new("gsutil");
    cmd.arg("cat").arg(format!("gs://{}{}", project_name, path));
    return execute(cmd);
}

pub fn sign(project_name: &str, path: &str, private_key: &str) -> String {
    let mut cmd = Command::new("gsutil");
    cmd.arg("signurl")
        .arg("-d")
        .arg("60m")
        .arg(private_key)
        .arg(format!("gs://{}{}", project_name, path));

    let output = String::from_utf8(execute(cmd)).unwrap();

    return match output.find("https://storage.googleapis.com") {
        Some(i) => output.get(i..).unwrap().to_string(),
        None => panic!("gsutil signurl output did not contain url: {}", output),
    };
}

pub fn upload(project_name: &str, local_source_path: &str, remote_dest_path: &str) {
    let mut cmd = Command::new("gsutil");
    cmd.arg("cp")
        .arg(local_source_path)
        .arg(format!("gs://{}{}", project_name, remote_dest_path));
    execute(cmd);
}

pub fn rm(project_name: &str, path: &str) {
    let mut cmd = Command::new("gsutil");
    cmd.arg("rm").arg(format!("gs://{}{}", project_name, path));
    execute(cmd);
}

fn execute(mut cmd: Command) -> Vec<u8> {
    return match cmd.output() {
        Ok(output) => {
            if !output.status.success() {
                println!("stdout:\n{}", String::from_utf8(output.stdout).unwrap());
                println!("stderr:\n{}", String::from_utf8(output.stderr).unwrap());
                panic!("gsutil outputted {}", output.status.code().unwrap_or(-1));
            }
            output.stdout
        }
        Err(err) => panic!("Error running {:?}: {}", cmd, err),
    };
}
