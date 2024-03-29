use azure_storage::prelude::*;
use azure_storage_blobs::container::operations::BlobItem;
use azure_storage_blobs::prelude::*;
use futures::stream::StreamExt;
use std::env;
use std::io::{Error, ErrorKind, Result};
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

pub async fn put_async(path: &str, content: Vec<u8>) -> Result<()> {
    let client = get_container_client()
        .blob_client(path.to_string());

    match client.put_block_blob(content).await {
        Ok(_) => {
            return Result::Ok(());
        }
        Err(err) => {
            return Result::Err(azure_error(err));
        }
    }
}

pub async fn upload_async(local_source_path: &str, remote_dest_path: &str) -> Result<()> {
    let content = std::fs::read(local_source_path)?;
    return put_async(remote_dest_path, content).await;
}

pub fn upload(local_source_path: &str, remote_dest_path: &str) -> Result<()> {
    return Runtime::new().unwrap().block_on(upload_async(local_source_path, remote_dest_path));
}

pub async fn cp_async(src_path: &str, dest_path: &str) -> Result<()> {
    let content = cat_async(src_path).await?;
    return put_async(dest_path, content).await;
}

pub fn cp(src_path: &str, dest_path: &str) -> Result<()> {
    return Runtime::new().unwrap().block_on(cp_async(src_path, dest_path));
}

pub async fn rm_async(path: &str) -> Result<()> {
    let client = get_container_client()
        .blob_client(path.to_string());

    match client.delete().await {
        Ok(_) => {
            return Result::Ok(());
        }
        Err(err) => {
            return Result::Err(azure_error(err));
        }
    }
}

pub fn rm(path: &str) -> Result<()> {
    return Runtime::new().unwrap().block_on(rm_async(path));
}
