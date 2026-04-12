use askama::Template;
use axum::{
    http::{header, HeaderValue},
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use serde::Serialize;
use std::{fs, net::SocketAddr, path::Path, time::Duration};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index))
        .route("/assets-manifest.json", get(assets_manifest))
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

async fn assets_manifest() -> impl IntoResponse {
    let manifest = AssetManifest {
        images: collection_images(),
    };

    (
        [(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-cache, no-store, must-revalidate"),
        )],
        Json(manifest),
    )
}

fn collection_images() -> Vec<String> {
    let mut images: Vec<String> = fs::read_dir("assets")
        .ok()
        .into_iter()
        .flatten()
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if !path.is_file() || !is_supported_image(&path) {
                return None;
            }

            Some(path.file_name()?.to_str()?.to_string())
        })
        .collect();

    images.sort_by_key(|name| name.to_ascii_lowercase());
    images
}

fn is_supported_image(path: &Path) -> bool {
    let Some(ext) = path.extension().and_then(|ext| ext.to_str()) else {
        return false;
    };

    matches!(
        ext.to_ascii_lowercase().as_str(),
        "png" | "jpg" | "jpeg" | "webp" | "gif" | "avif"
    )
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

#[derive(Serialize)]
struct AssetManifest {
    images: Vec<String>,
}
