use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EnvironmentType {
    Live,
    Staging,
    Development,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,
    pub container_id: String,
    pub name: String,
    pub env_type: EnvironmentType,
    pub token: String,
    pub pinned_version_id: Option<String>,
}

impl Environment {
    pub fn new(id: &str, container_id: &str, name: &str, env_type: EnvironmentType) -> Self {
        let token = format!("env_{}_{}", id, rand_hex_token(12));
        Self {
            id: id.to_string(),
            container_id: container_id.to_string(),
            name: name.to_string(),
            env_type,
            token,
            pinned_version_id: None,
        }
    }

    pub fn pin_version(&mut self, version_id: &str) {
        self.pinned_version_id = Some(version_id.to_string());
    }

    pub fn verify_token(&self, token: &str) -> bool {
        self.token == token
    }
}

fn rand_hex_token(len: usize) -> String {
    use sha2::{Digest, Sha256};
    let seed = format!("{}_{}", chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0), len);
    let hash = format!("{:x}", Sha256::digest(seed.as_bytes()));
    hash[..len].to_string()
}
