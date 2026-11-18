use sha2::{Digest, Sha256};

pub struct PathObfuscator;

impl PathObfuscator {
    /// Generates deterministic cloaked paths with a custom action endpoint name (defaults to "sync")
    /// Completely eliminates ad-blocker keywords like "collect", "analytics", "gtm", "ga"
    pub fn generate_cloaked_paths_with_action(
        container_id: &str,
        secret_salt: &str,
        action: &str,
    ) -> (String, String) {
        let hash = format!(
            "{:x}",
            Sha256::digest(format!("{}:{}", container_id, secret_salt).as_bytes())
        );
        let token = &hash[..12];
        let script_path = format!("/_trk/{}/app.js", token);
        let ingest_path = format!("/_trk/{}/{}", token, action);
        (script_path, ingest_path)
    }

    /// Default cloaked paths using innocent action name "sync"
    pub fn generate_cloaked_paths(container_id: &str, secret_salt: &str) -> (String, String) {
        Self::generate_cloaked_paths_with_action(container_id, secret_salt, "sync")
    }

    /// Verifies if a given request path matches the expected cloaked token for a container
    pub fn verify_cloaked_path(
        path: &str,
        container_id: &str,
        secret_salt: &str,
        action: Option<&str>,
    ) -> bool {
        let action_name = action.unwrap_or("sync");
        let (expected_script, expected_ingest) =
            Self::generate_cloaked_paths_with_action(container_id, secret_salt, action_name);
        path == expected_script || path == expected_ingest
    }

    /// Extracts the token and action from a cloaked path e.g. "/_trk/abc123456789/sync"
    pub fn extract_token_and_action(path: &str) -> Option<(&str, &str)> {
        let parts: Vec<&str> = path.split('/').collect();
        if parts.len() >= 4 && parts[1] == "_trk" {
            Some((parts[2], parts[3]))
        } else {
            None
        }
    }

    /// Extracts the token from a cloaked path e.g. "/_trk/abc123456789/sync"
    pub fn extract_token(path: &str) -> Option<&str> {
        let parts: Vec<&str> = path.split('/').collect();
        if parts.len() >= 3 && parts[1] == "_trk" {
            Some(parts[2])
        } else {
            None
        }
    }
}
