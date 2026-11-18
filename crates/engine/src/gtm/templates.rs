use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TemplateType {
    Tag,
    Variable,
    Client,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplatePermission {
    pub permission_type: String,
    #[serde(default)]
    pub allowed_keys: Vec<String>,
    #[serde(default)]
    pub allowed_urls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomTemplate {
    pub id: String,
    pub name: String,
    pub template_type: TemplateType,
    pub sandboxed_code: String,
    pub permissions: Vec<TemplatePermission>,
}

impl CustomTemplate {
    pub fn new(id: &str, name: &str, template_type: TemplateType, code: &str) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            template_type,
            sandboxed_code: code.to_string(),
            permissions: Vec::new(),
        }
    }

    pub fn with_permission(mut self, perm: TemplatePermission) -> Self {
        self.permissions.push(perm);
        self
    }

    pub fn can_access_global(&self, key: &str) -> bool {
        self.permissions.iter().any(|p| {
            p.permission_type == "access_globals"
                && (p.allowed_keys.is_empty() || p.allowed_keys.iter().any(|k| k == key || k == "*"))
        })
    }

    pub fn can_read_cookie(&self, cookie_name: &str) -> bool {
        self.permissions.iter().any(|p| {
            p.permission_type == "read_cookies"
                && (p.allowed_keys.is_empty() || p.allowed_keys.iter().any(|k| k == cookie_name || k == "*"))
        })
    }

    pub fn can_send_pixel(&self, url: &str) -> bool {
        self.permissions.iter().any(|p| {
            p.permission_type == "send_pixel"
                && (p.allowed_urls.is_empty() || p.allowed_urls.iter().any(|u| url.starts_with(u)))
        })
    }

    pub fn can_read_datalayer(&self, path: &str) -> bool {
        self.permissions.iter().any(|p| {
            p.permission_type == "read_data_layer"
                && (p.allowed_keys.is_empty() || p.allowed_keys.iter().any(|k| path.starts_with(k) || k == "*"))
        })
    }
}
