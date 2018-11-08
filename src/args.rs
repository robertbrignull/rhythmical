extern crate lazy_static;

pub struct Args {
    pub project_name: String,
}

lazy_static! {
    static ref ARGS: Args = {
        let args: Vec<String> = std::env::args().collect();
        if args.len() != 2 {
            panic!("Incorrect arguments. Usage: rhythmical project-name");
        }

        Args {
            project_name: args[1].clone(),
        }
    };
}

impl Args {
    pub fn get() -> &'static Args {
        return &ARGS;
    }
}
