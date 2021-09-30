use std::collections::HashSet;
use std::iter::FromIterator;

use args::ValidateLibraryArgs;
use gsutil;
use library::Library;

pub fn validate_library(args: ValidateLibraryArgs) {
    let library = Library::new(&args.project_name);

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

    let all_paths = gsutil::ls(&args.project_name, "/Music").expect("Unable to list paths");
    let mut unknown_paths: HashSet<String> = HashSet::from_iter(all_paths);
    for song in library.songs.values() {
        unknown_paths.remove(&song.file_location);
    }
    println!("Found {} paths to be deleted", unknown_paths.len());

    let mut paths_to_delete: Vec<String> = Vec::new();
    for (i, id) in badly_located_songs.iter().enumerate() {
        let song = library.songs.get(&id).unwrap();
        let new_file_location = song.generate_file_location();
        paths_to_delete.push(song.file_location.clone());
        if args.dry_run {
            println!("Would copy {} to {}", song.file_location, new_file_location);
        } else {
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
        }
    }

    for (i, path) in unknown_paths.iter().enumerate() {
        if args.dry_run {
            println!("Would delete {}", path);
        } else {
            println!("Deleting {} ({} / {})", path, i, unknown_paths.len());
            match gsutil::rm(&args.project_name, &format!("/Music{}", path)) {
                Ok(()) => {}
                Err(err) => {
                    println!("Unable to delete path \"{}\": {}", path, err);
                }
            }
        }
    }

    for (i, path) in paths_to_delete.iter().enumerate() {
        if args.dry_run {
            println!("Would clean up old file {}", path);
        } else {
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
        }
    }
}
