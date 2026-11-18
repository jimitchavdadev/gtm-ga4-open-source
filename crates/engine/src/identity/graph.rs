use std::collections::HashMap;

pub struct IdentityGraph {
    device_to_user: HashMap<String, String>,
    user_to_devices: HashMap<String, Vec<String>>,
}

impl Default for IdentityGraph {
    fn default() -> Self {
        Self::new()
    }
}

impl IdentityGraph {
    pub fn new() -> Self {
        Self {
            device_to_user: HashMap::new(),
            user_to_devices: HashMap::new(),
        }
    }

    pub fn link(&mut self, client_id: &str, user_id: &str) {
        self.device_to_user.insert(client_id.to_string(), user_id.to_string());
        let devices = self.user_to_devices.entry(user_id.to_string()).or_default();
        if !devices.contains(&client_id.to_string()) {
            devices.push(client_id.to_string());
        }
    }

    pub fn get_user_id(&self, client_id: &str) -> Option<&str> {
        self.device_to_user.get(client_id).map(|s| s.as_str())
    }

    pub fn get_devices_for_user(&self, user_id: &str) -> &[String] {
        self.user_to_devices.get(user_id).map(|v| v.as_slice()).unwrap_or(&[])
    }

    pub fn get_canonical_id(&self, client_id: &str, user_id: Option<&str>) -> String {
        if let Some(uid) = user_id {
            return uid.to_string();
        }
        if let Some(linked_uid) = self.get_user_id(client_id) {
            return linked_uid.to_string();
        }
        client_id.to_string()
    }
}
