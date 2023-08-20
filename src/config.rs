use figment::providers::{Format, Serialized, Toml};
use figment::Figment;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub db_path: &'static str,
    pub token: &'static str,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            db_path: "database.db",
            token: "TOKEN_HERE",
        }
    }
}

impl Config {
    pub fn db_path_full(&self) -> String {
        format!("{}?mode=rwc", self.db_path)
    }
}

pub fn load_config(config_path: PathBuf) -> Result<Config, figment::Error> {
    Figment::from(Serialized::defaults(Config::default()))
        .merge(Toml::file(config_path))
        .extract()
}
