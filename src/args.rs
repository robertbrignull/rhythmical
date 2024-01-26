#[derive(Clone)]
pub enum Mode {
    Serve,
    SyncRhythmdb,
    ValidateLibrary,
    TestAzure,
}

impl Mode {
    fn parse(val: String) -> Option<Mode> {
        if val.eq("serve") {
            return Option::Some(Mode::Serve);
        }
        if val.eq("sync-rhythmdb") {
            return Option::Some(Mode::SyncRhythmdb);
        }
        if val.eq("validate-library") {
            return Option::Some(Mode::ValidateLibrary);
        }
        if val.eq("test-azure") {
            return Option::Some(Mode::TestAzure);
        }
        return Option::None;
    }
}

#[derive(Clone)]
pub struct Args {
    pub mode: Mode,
    pub serve: Option<ServeArgs>,
    pub sync_rhythmdb: Option<SyncRhythmdbArgs>,
    pub validate_library: Option<ValidateLibraryArgs>,
}

#[derive(Clone)]
pub struct ServeArgs {
    pub project_name: String,
    pub private_key: String,
}

#[derive(Clone)]
pub struct SyncRhythmdbArgs {
    pub project_name: String,
    pub rhythmdb_file: String,
    pub library_location_prefix: String,
    pub dry_run: bool,
    pub verbose: bool,
}

#[derive(Clone)]
pub struct ValidateLibraryArgs {
    pub project_name: String,
    pub dry_run: bool,
    pub verbose: bool,
}

const USAGE_MESSAGE: &str = "Incorrect arguments. Usage:
  serve project-name private-key
  sync-rhythmdb project-name rhythmdb-file library-location-prefix [--dry-run] [--verbose]
  validate-library project-name [--dry-run] [--verbose]";

impl Args {
    pub fn get() -> Args {
        let args: Vec<String> = std::env::args().collect();
        if args.len() < 2 {
            println!("{}", USAGE_MESSAGE);
            std::process::exit(1);
        }

        return match Mode::parse(args[1].clone()) {
            Some(Mode::Serve) => {
                if args.len() != 4 {
                    println!("{}", USAGE_MESSAGE);
                    std::process::exit(1);
                }
                Args {
                    mode: Mode::Serve,
                    serve: Option::Some(ServeArgs {
                        project_name: args[2].clone(),
                        private_key: args[3].clone(),
                    }),
                    sync_rhythmdb: Option::None,
                    validate_library: Option::None,
                }
            }
            Some(Mode::SyncRhythmdb) => {
                if args.len() < 5 {
                    println!("{}", USAGE_MESSAGE);
                    std::process::exit(1);
                }
                let mut dry_run = false;
                let mut verbose = false;
                for i in 5..args.len() {
                    if args[i] == "--dry-run" {
                        dry_run = true;
                    } else if args[i] == "--verbose" {
                        verbose = true;
                    } else {
                        println!("{}", USAGE_MESSAGE);
                        std::process::exit(1);
                    }
                }
                Args {
                    mode: Mode::SyncRhythmdb,
                    serve: Option::None,
                    sync_rhythmdb: Option::Some(SyncRhythmdbArgs {
                        project_name: args[2].clone(),
                        rhythmdb_file: args[3].clone(),
                        library_location_prefix: args[4].clone(),
                        dry_run: dry_run,
                        verbose: verbose,
                    }),
                    validate_library: Option::None,
                }
            }
            Some(Mode::ValidateLibrary) => {
                if args.len() < 3 {
                    println!("{}", USAGE_MESSAGE);
                    std::process::exit(1);
                }
                let mut dry_run = false;
                let mut verbose = false;
                for i in 3..args.len() {
                    if args[i] == "--dry-run" {
                        dry_run = true;
                    } else if args[i] == "--verbose" {
                        verbose = true;
                    } else {
                        println!("{}", USAGE_MESSAGE);
                        std::process::exit(1);
                    }
                }
                Args {
                    mode: Mode::ValidateLibrary,
                    serve: Option::None,
                    sync_rhythmdb: Option::None,
                    validate_library: Option::Some(ValidateLibraryArgs {
                        project_name: args[2].clone(),
                        dry_run: dry_run,
                        verbose: verbose,
                    }),
                }
            }
            Some(Mode::TestAzure) => {
              Args {
                mode: Mode::TestAzure,
                serve: Option::None,
                sync_rhythmdb: Option::None,
                validate_library: Option::None,
              }
            }
            None => {
                println!("{}", USAGE_MESSAGE);
                std::process::exit(1);
            }
        };
    }
}
