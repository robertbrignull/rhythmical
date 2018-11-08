extern crate lazy_static;

pub enum Mode {
    SERVE
}

impl Mode {
    fn parse(val: String) -> Self {
        if val.eq("serve") {
            return Mode::SERVE;
        }
        panic!(format!("Unknown mode '{}'", val));
    }
}

pub struct Args {
    pub mode: Mode,
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

        Args {
            mode: Mode::parse(args[1].clone()),
            project_name: args[2].clone(),
            private_key: args[3].clone(),
        }
    };
}

impl Args {
    pub fn get() -> &'static Args {
        return &ARGS;
    }
}
