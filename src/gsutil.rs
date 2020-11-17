use std::process::Command;

use args::ServeArgs;

pub fn cat(path: &String) -> Vec<u8> {
    let project_name = &ServeArgs::get().project_name;
    let mut cmd = Command::new("gsutil");
    cmd.arg("cat");
    cmd.arg(format!("gs://{}{}", project_name, path));
    return execute(cmd);
}

pub fn sign(path: &String) -> String {
    let args = ServeArgs::get();
    let mut cmd = Command::new("gsutil");
    cmd.arg("signurl")
        .arg("-d").arg("60m")
        .arg(&args.private_key)
        .arg(format!("gs://{}{}", args.project_name, path));

    let output = String::from_utf8(execute(cmd)).unwrap();

    return match output.find("https://storage.googleapis.com") {
        Some(i) => output.get(i..).unwrap().to_string(),
        None => panic!(format!("gsutil signurl output did not contain url: {}", output))
    };
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
        },
        Err(err) => panic!("Error running {:?}: {}", cmd, err)
    };
}
