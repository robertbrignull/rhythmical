#[derive(Clone)]
pub enum Mode {
    Serve,
    SyncRhythmdb,
}

impl Mode {
    fn parse(val: String) -> Option<Mode> {
        if val.eq("serve") {
            return Option::Some(Mode::Serve);
        }
        if val.eq("sync-rhythmdb") {
            return Option::Some(Mode::SyncRhythmdb);
        }
        return Option::None;
    }
}

#[derive(Clone)]
pub struct Args {
    pub mode: Mode,
    pub serve: Option<ServeArgs>,
    pub sync_rhythmdb: Option<SyncRhythmdbArgs>,
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
}

const USAGE_MESSAGE: &str = "Incorrect arguments. Usage:
  serve project-name private-key
  sync-rhythmdb project-name rhythmdb-file library-location-prefix [--dry-run]";

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
                }
            }
            Some(Mode::SyncRhythmdb) => {
                if (args.len() != 5 && args.len() != 6)
                    || (args.len() == 6 && !args[5].eq("--dry-run"))
                {
                    println!("{}", USAGE_MESSAGE);
                    std::process::exit(1);
                }
                Args {
                    mode: Mode::SyncRhythmdb,
                    serve: Option::None,
                    sync_rhythmdb: Option::Some(SyncRhythmdbArgs {
                        project_name: args[2].clone(),
                        rhythmdb_file: args[3].clone(),
                        library_location_prefix: args[4].clone(),
                        dry_run: args.len() == 6,
                    }),
                }
            }
            None => {
                println!("{}", USAGE_MESSAGE);
                std::process::exit(1);
            }
        };
    }
}
