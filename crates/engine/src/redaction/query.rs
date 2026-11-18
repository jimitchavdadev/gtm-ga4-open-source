use super::email::redact_emails;

pub fn strip_sensitive_params(url_str: &str, sensitive_keys: &[&str]) -> String {
    let parts: Vec<&str> = url_str.splitn(2, '?').collect();
    if parts.len() < 2 {
        return url_str.to_string();
    }

    let base = parts[0];
    let query = parts[1];

    let retained: Vec<String> = query
        .split('&')
        .filter(|pair| {
            if pair.is_empty() {
                return false;
            }
            let key = pair.split('=').next().unwrap_or("");
            let key_lower = key.to_ascii_lowercase();
            !sensitive_keys.iter().any(|k| key_lower == k.to_ascii_lowercase())
        })
        .map(|s| s.to_string())
        .collect();

    if retained.is_empty() {
        base.to_string()
    } else {
        format!("{}?{}", base, retained.join("&"))
    }
}

pub fn sanitize_url(url_str: &str, sensitive_keys: &[&str], redact_email: bool) -> String {
    let stripped = strip_sensitive_params(url_str, sensitive_keys);
    if redact_email {
        redact_emails(&stripped)
    } else {
        stripped
    }
}
