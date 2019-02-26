extern crate lazy_static;

#[derive(Clone)]
pub enum Mode {
    Serve,
    ParseRhythmDb,
}

impl Mode {
    fn parse(val: String) -> Option<Mode> {
        if val.eq("serve") {
            return Option::Some(Mode::Serve);
        }
        if val.eq("parse-rhythm-db") {
            return Option::Some(Mode::ParseRhythmDb);
        }
        return Option::None;
    }
}

#[derive(Clone)]
pub struct Args {
    mode: Mode,
    serve: Option<ServeArgs>,
    parse_rhythm_db: Option<ParseRhythmDbArgs>,
}

#[derive(Clone)]
pub struct ServeArgs {
    pub project_name: String,
    pub private_key: String,
}

#[derive(Clone)]
pub struct ParseRhythmDbArgs {
    pub input_file: String,
    pub output_file: String,
    pub library_location_prefix: String,
}

const USAGE_MESSAGE: &str = "Incorrect arguments. Usage:
  serve project-name private-key
  parse-rhythm-db input-file output-file library-location-prefix";

lazy_static! {
    static ref ARGS: Args = {
        let args: Vec<String> = std::env::args().collect();
        if args.len() < 2 {
            println!("{}", USAGE_MESSAGE);
            std::process::exit(1);
        }

        match Mode::parse(args[1].clone()) {
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
                    parse_rhythm_db: Option::None,
                }
            },
            Some(Mode::ParseRhythmDb) => {
                if args.len() != 5 {
                    println!("{}", USAGE_MESSAGE);
                    std::process::exit(1);
                }
                Args {
                    mode: Mode::ParseRhythmDb,
                    serve: Option::None,
                    parse_rhythm_db: Option::Some(ParseRhythmDbArgs {
                        input_file: args[2].clone(),
                        output_file: args[3].clone(),
                        library_location_prefix: args[4].clone(),
                    }),
                }
            },
            None => {
                println!("{}", USAGE_MESSAGE);
                std::process::exit(1);
            },
        }
    };
}

impl Args {
    pub fn get_mode() -> &'static Mode {
        return &ARGS.mode;
    }
}

impl ServeArgs {
    pub fn get() -> ServeArgs {
        return ARGS.clone().serve.unwrap();
    }
}

impl ParseRhythmDbArgs {
    pub fn get() -> ParseRhythmDbArgs {
        return ARGS.clone().parse_rhythm_db.unwrap();
    }
}
