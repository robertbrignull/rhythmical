use azure_storage::prelude::*;
use azure_storage_blobs::container::operations::BlobItem;
use azure_storage_blobs::prelude::*;
use futures::stream::StreamExt;
use std::env;
use std::io::{Error, ErrorKind, Result};
use std::process::Command;
use tokio::runtime::Runtime;
use time::{Duration, OffsetDateTime};

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

pub async fn sign_async(path: &str) -> Result<String> {
    let permissions = BlobSasPermissions {
        read: true,
        add: false,
        create: false,
        write: false,
        delete: false,
        delete_version: false,
        permanent_delete: false,
        list: false,
        tags: false,
        move_: false,
        execute: false,
        ownership: false,
        permissions: false,
    };
    let expiry = OffsetDateTime::now_utc() + Duration::hours(1);
    let client = get_container_client()
        .blob_client(path.to_string());
    let signature = client.shared_access_signature(permissions, expiry).await;

    match signature {
        Ok(signature) => {
            match signature.token() {
                Ok(token) => {
                    let account_name = read_env_var("AZURE_ACCOUNT_NAME");
                    let container_name = read_env_var("AZURE_CONTAINER_NAME");
                    let url = format!("https://{}.blob.core.windows.net/{}/{}?{}", account_name, container_name, path, token);
                    return Ok(url);
                }
                Err(err) => {
                    return Result::Err(azure_error(err));
                }
            }
        }
        Err(err) => {
            return Result::Err(azure_error(err));
        }
    }
}

pub fn sign(path: &str) -> Result<String> {
    return Runtime::new().unwrap().block_on(sign_async(path));
}

pub async fn upload_async(local_source_path: &str, remote_dest_path: &str) -> Result<()> {
    let body = std::fs::read(local_source_path)?;

    let client = get_container_client()
        .blob_client(remote_dest_path.to_string());

    match client.put_block_blob(body).await {
        Ok(_) => {
            return Result::Ok(());
        }
        Err(err) => {
            return Result::Err(azure_error(err));
        }
    }
}

pub fn upload(local_source_path: &str, remote_dest_path: &str) -> Result<()> {
    return Runtime::new().unwrap().block_on(upload_async(local_source_path, remote_dest_path));
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
