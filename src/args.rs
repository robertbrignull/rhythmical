extern crate lazy_static;

pub struct Args {
    pub project_name: String,
    pub private_key: String,
}

lazy_static! {
    static ref ARGS: Args = {
        let args: Vec<String> = std::env::args().collect();
        if args.len() != 3 {
            panic!("Incorrect arguments. Usage: rhythmical project-name private-key");
        }

        Args {
            project_name: args[1].clone(),
            private_key: args[2].clone(),
        }
    };
}

impl Args {
    pub fn get() -> &'static Args {
        return &ARGS;
    }
}
