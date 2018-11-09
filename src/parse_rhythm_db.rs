use std::fs::File;
use std::io::Read;
use std::io::Write;

use args::ParseRhythmDbArgs;

pub fn parse_rhythm_db() {
    let args = ParseRhythmDbArgs::get();

    let mut input_file = File::open(args.input_file)
        .expect("Input file not found");
    let mut output_file = File::create(args.output_file)
        .expect("Output file could not be created");

    let mut contents = String::new();
    input_file.read_to_string(&mut contents).unwrap();

    output_file.write_all(contents.as_bytes())
        .expect("Unable to write to output file");
}
