# Rhythmical

A browser based music player and organiser.

I have written this because I couldn't find an existing music player that offers the feaures that I want.
The look and feel is loosely based on other music players that I've used - primarily Rhythmbox for linux.

The requirements are:
- Be able to handle 5000+ songs efficiently.
- Be able to play anywhere from a single source and not have to worry about syncing between copies.
- Be cheap or free.
- Be able to easily define playlists and filters.
- Be able to rate songs and classify them in to multiple categories and genres.

The solution I have come up combines Google Cloud Storage and a browser-based single-page application.
Storing the media files and all metadata in the cloud ensures that they are available anywhere,
and Google Cloud Storage is cheap enough that for 50GB of music the costs are at most $1 per month.
Using the browser for the GUI avoids much of the work of finding a good native library and ensures
that it works on all operating systems. 

I am also using this project as a tool for teaching myself new languages and frameworks.
I am using Typescript and React for the frontend and Rust for the backend.
Although I have used the frontend technologies before, I am completely new to Rust so this
is a good opportunity to learn about it while programming a simple server.

## Requirements

The backend builds with a stable version of Rust.
At time of writing it is confirmed working with 1.32.0.

The frontend requires nodejs and npm to be installed.
At time of writing it is confirmed working with npm version 6.4.1 and node version 8.15.0.

Communication to Google Cloud Storage is done by delegating to gcloud and this must be installed.
At time of writing it is confirmed working with Google Cloud SDK 236.0.0 and gsutil 4.36.

## How to build

Simply run `cargo build --release` to build the server and frontend code.

## How to run

Run `cargo run --release serve <GCS bucket name> <path to json private key>`.

The bucket must have a file called `library.json` at its root.
The private key will be used when signing URLs.
 