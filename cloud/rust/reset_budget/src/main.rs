use anyhow::Result;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use std::env;

use commands::reset_budget;

async fn handle_request(_event: LambdaEvent<serde_json::Value>) -> Result<serde_json::Value> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    reset_budget(pool).await?;

    Ok(json!({"status": "ok"}))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(handle_request)).await?;
    Ok(())
}
