pub struct CookieArmor;

impl CookieArmor {
    /// Generates a Set-Cookie header value for First-Party Cookie Armor (Anti-ITP)
    /// Max-Age=63072000 (2 full years) overrides WebKit 24h / 7-day client-side caps
    pub fn generate_set_cookie_header(cookie_name: &str, value: &str, domain: Option<&str>) -> String {
        let domain_str = match domain {
            Some(d) => format!("; Domain={}", d),
            None => "".to_string(),
        };
        format!(
            "{}={}; Max-Age=63072000; Path=/; HttpOnly; Secure; SameSite=Lax{}",
            cookie_name, value, domain_str
        )
    }

    /// Extracts armored cookie value from incoming Cookie header
    pub fn extract_cookie<'a>(cookie_header: &'a str, name: &str) -> Option<&'a str> {
        for part in cookie_header.split(';') {
            let mut kv = part.trim().split('=');
            if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
                if k == name {
                    return Some(v);
                }
            }
        }
        None
    }

    /// Determines the effective client ID: prefers server-set HttpOnly cookie, falls back to wire cid
    pub fn resolve_durable_client_id<'a>(
        cookie_header: Option<&'a str>,
        cookie_name: &str,
        wire_cid: &'a str,
    ) -> &'a str {
        if let Some(h) = cookie_header {
            if let Some(cookie_val) = Self::extract_cookie(h, cookie_name) {
                if !cookie_val.is_empty() {
                    return cookie_val;
                }
            }
        }
        wire_cid
    }
}
