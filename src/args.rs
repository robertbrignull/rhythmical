extern crate lazy_static;

#[derive(Clone)]
pub enum Mode {
    Serve,
}

impl Mode {
    fn parse(val: String) -> Self {
        if val.eq("serve") {
            return Mode::Serve;
        }
        panic!(format!("Unknown mode '{}'", val));
    }
}

#[derive(Clone)]
pub struct Args {
    mode: Mode,
    serve: Option<ServeArgs>,
}

#[derive(Clone)]
pub struct ServeArgs {
    pub project_name: String,
    pub private_key: String,
}

lazy_static! {
    static ref ARGS: Args = {
        let args: Vec<String> = std::env::args().collect();
        if args.len() != 4 {
            panic!("Incorrect arguments. Usage:\
              serve rhythmical project-name private-key");
        }

        match Mode::parse(args[1].clone()) {
            Mode::Serve =>
                Args {
                    mode: Mode::Serve,
                    serve: Option::Some(ServeArgs {
                        project_name: args[2].clone(),
                        private_key: args[3].clone(),
                    })
                }
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
