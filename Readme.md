# Rhythmical

A browser + cloud based music player and organiser.

I wrote this because I couldn't find an existing music player that offered the feaures I want. The look and feel is loosely based on other music players that I've used, such as Rhythmbox for linux.

The requirements are:
- Be able to handle tens of thousands of songs efficiently.
- Be able to play anywhere from a single source and not have to worry about syncing between copies.
- Be cheap or free.
- Be able to easily define playlists and filters.
- Be able to rate songs and classify them in to multiple categories and genres.

The solution I have come up combines online blob storage (currently Azure) and a browser-based single-page application.
Storing the media files and all metadata in the cloud ensures that they are available anywhere, and Azure blob storage is cheap enough that for 50GB of music the costs are at most $1 per month.
Using the browser for the GUI avoids much of the work of finding a good native library and ensures that it works on all operating systems. 

I am also using this project as a tool for teaching myself new languages and frameworks.
I am using Typescript and React for the frontend and Rust for the backend.
Although I have used the frontend technologies before, I am completely new to Rust so this is a good opportunity to learn about it while programming a simple server.

## Requirements

The backend builds with a stable version of Rust.
At time of writing it is confirmed working with 1.75.0.

The frontend requires nodejs and npm to be installed.
At time of writing it is confirmed working with npm version 9.6.7 and node version 18.17.1.

## Building

Simply run `cargo build --release` to build the server and frontend code.

## Running

The following three environment variables must always be provided:
- `AZURE_ACCOUNT_NAME`
- `AZURE_ACCESS_KEY`
- `AZURE_CONTAINER_NAME`

### Running the server

Run `cargo run --release serve`.

The container must have a file called `library.json` at its root.

### Syncing a rhythmdb file

Run `cargo run --release sync-rhythmdb <path to rhythmdb.xml> <library location prefix> [--dry-run]`.

### Validating library

Run `cargo run --release validate-library [--dry-run] [--verbose]`.
