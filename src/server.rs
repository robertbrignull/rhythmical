extern crate rocket;

#[get("/")]
fn root() -> String {
    return format!("Hello, world!")
}

pub fn start_server() {
    rocket::ignite().mount("/", routes![root]).launch();
}
