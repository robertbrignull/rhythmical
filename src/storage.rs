use azure_storage::prelude::*;
use azure_storage_blobs::container::operations::BlobItem;
use azure_storage_blobs::prelude::*;
use futures::stream::StreamExt;
use std::env;
use std::io::{Error, ErrorKind, Result};
use std::path::Path;
use std::process::Command;
use tokio::runtime::Runtime;

fn read_env_var(name: &str) -> String {
    return env::var(name).expect(&format!("Unable to read environment variable: {}", name));
}

fn azure_error(err: azure_storage::Error) -> Error {
    return Error::new(
        ErrorKind::Other,
        format!("error accessing azure: {}", err.to_string()),
    );
}

fn get_container_client() -> ContainerClient {
    let account_name = read_env_var("AZURE_ACCOUNT_NAME");
    let access_key = read_env_var("AZURE_ACCESS_KEY");
    let container_name = read_env_var("AZURE_CONTAINER_NAME");

    let storage_credentials = StorageCredentials::access_key(account_name.clone(), access_key);
    return ClientBuilder::new(account_name, storage_credentials).container_client(container_name);
}

pub async fn ls_async(path: &str) -> Result<Vec<String>> {
    let mut stream = get_container_client()
        .list_blobs()
        .prefix(path.to_string())
        .into_stream();

    let mut blobs: Vec<String> = Vec::new();
    while let Some(value) = stream.next().await {
        match value {
            Ok(value) => {
                for blob in value.blobs.items {
                    match blob {
                        BlobItem::Blob(blob) => {
                            blobs.push(blob.name);
                        }
                        BlobItem::BlobPrefix(_) => (),
                    }
                }
            }
            Err(err) => {
                return Result::Err(azure_error(err));
            }
        }
    }

    return Ok(blobs);
}

pub fn ls(path: &str) -> Result<Vec<String>> {
    return Runtime::new().unwrap().block_on(ls_async(path));
}

pub async fn cat_async(path: &str) -> Result<Vec<u8>> {
    let mut stream = get_container_client()
        .blob_client(path.to_string())
        .get()
        .into_stream();

    let mut data: Vec<u8> = Vec::new();
    while let Some(value) = stream.next().await {
        match value {
            Ok(mut value) => {
                while let Some(bytes) = value.data.next().await {
                    match bytes {
                        Ok(bytes) => {
                            data.extend(bytes);
                        }
                        Err(err) => {
                            return Result::Err(azure_error(err));
                        }
                    }
                }
            }
            Err(err) => {
                return Result::Err(azure_error(err));
            }
        }
    }

    return Ok(data);
}

pub fn cat(path: &str) -> Result<Vec<u8>> {
    return Runtime::new().unwrap().block_on(cat_async(path));
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
