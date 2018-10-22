mod library;

use library::load_library;

fn main() {
    for song in load_library().songs {
        println!("{}", song.name);
    }
}
