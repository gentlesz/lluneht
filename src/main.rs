use askama::Template;
use axum::{
    response::{Html, IntoResponse},
    routing::get,
    Router,
};
use std::{fs, net::SocketAddr, time::Duration};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index))
        .nest_service("/assets", ServeDir::new("assets"));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind TCP listener");

    println!("NULLs is live at http://{addr}");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server error");
}

async fn index() -> impl IntoResponse {
    let page = LandingPageTemplate {
        images: collection_images(),
    };

    Html(page.render().expect("failed to render landing page"))
}

fn collection_images() -> Vec<String> {
    let mut numbered_images: Vec<(u32, String)> = fs::read_dir("assets")
        .ok()
        .into_iter()
        .flatten()
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if !path.is_file() {
                return None;
            }

            let extension = path.extension()?.to_str()?;
            if extension != "png" {
                return None;
            }

            let stem = path.file_stem()?.to_str()?;
            let index = stem.strip_prefix('n')?.parse::<u32>().ok()?;
            let file_name = path.file_name()?.to_str()?.to_string();

            Some((index, file_name))
        })
        .collect();

    numbered_images.sort_by_key(|(index, _)| *index);

    numbered_images
        .into_iter()
        .map(|(_, file_name)| file_name)
        .collect()
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
        _ = tokio::time::sleep(Duration::from_secs(60 * 60 * 24)) => {},
    }
}

#[derive(Template)]
#[template(path = "index.html")]
struct LandingPageTemplate {
    images: Vec<String>,
}
