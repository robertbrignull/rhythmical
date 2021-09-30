use std::collections::HashSet;
use std::iter::FromIterator;

use args::ValidateLibraryArgs;
use gsutil;
use library::Library;

pub fn validate_library(args: ValidateLibraryArgs) {
    let mut library = Library::new(&args.project_name);

    let mut badly_located_songs: Vec<u32> = Vec::new();
    for song in library.songs.values() {
        if !song.has_valid_file_location() {
            badly_located_songs.push(song.id);
        }
    }
    println!(
        "Found {} songs not at an expected file location",
        badly_located_songs.len()
    );

    // All paths present in cloud storage
    let all_paths = gsutil::ls(&args.project_name, "/Music").expect("Unable to list paths");

    // Paths that aren't associated to a song, and therefore should be deleted
    let mut unknown_paths: HashSet<String> = HashSet::from_iter(all_paths);
    // Songs where the associated file is missing
    let mut missing_songs: Vec<u32> = Vec::new();

    for song in library.songs.values() {
        if !unknown_paths.remove(&song.file_location) {
            missing_songs.push(song.id);
        }
    }
    println!("Found {} paths to be deleted", unknown_paths.len());
    println!("Found {} songs where the file is missing", missing_songs.len());

    // Copy any badly located songs to their new location
    let mut paths_to_delete: Vec<String> = Vec::new();
    for (i, id) in badly_located_songs.iter().enumerate() {
        let mut song = library.songs.get_mut(&id).unwrap();
        let new_file_location = song.generate_file_location();
        paths_to_delete.push(song.file_location.clone());
        if !args.dry_run {
            println!(
                "Copying {} to {} ({} / {})",
                song.file_location,
                new_file_location,
                i,
                badly_located_songs.len()
            );
            gsutil::cp(
                &args.project_name,
                &format!("/Music{}", song.file_location),
                &format!("/Music{}", new_file_location),
            )
            .unwrap();
        } else if args.verbose {
            println!("Would copy {} to {}", song.file_location, new_file_location);
        }
        song.file_location = new_file_location;

        // Do a checkpoint of our progress so far
        if i % 100 == 0 && !args.dry_run {
            println!("Uploading library");
            library.save(&args.project_name).unwrap();
        }
    }

    // Remove from the library any songs where the file is missing
    for id in missing_songs {
        let song = library.songs.get(&id).unwrap();
        if !args.dry_run {
            println!("Removing {} from the library", song.file_location);
            library.songs.remove(&id);
        } else if args.verbose {
            println!("Would remove {} from the library", song.file_location);
        }
    }

    // Upload the updated library
    if !args.dry_run {
        println!("Uploading library");
        library.save(&args.project_name).unwrap();
    } else if args.verbose {
        println!("Would upload new library");
    }

    // Delete the old files for songs that were just moved
    for (i, path) in paths_to_delete.iter().enumerate() {
        if !args.dry_run {
            println!(
                "Cleaning up old file {} ({} / {})",
                path,
                i,
                paths_to_delete.len()
            );
            match gsutil::rm(&args.project_name, &format!("/Music{}", path)) {
                Ok(()) => {}
                Err(err) => {
                    println!("Unable to delete path \"{}\": {}", path, err);
                }
            }
        } else if args.verbose {
            println!("Would clean up old file {}", path);
        }
    }

    // Delete any files that we don't know about
    for (i, path) in unknown_paths.iter().enumerate() {
        if !args.dry_run {
            println!("Deleting {} ({} / {})", path, i, unknown_paths.len());
            match gsutil::rm(&args.project_name, &format!("/Music{}", path)) {
                Ok(()) => {}
                Err(err) => {
                    println!("Unable to delete path \"{}\": {}", path, err);
                }
            }
        } else if args.verbose {
            println!("Would delete {}", path);
        }
    }
}
