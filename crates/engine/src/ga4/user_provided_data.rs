use sha2::{Digest, Sha256};

pub struct UserProvidedDataNormalizer;

impl UserProvidedDataNormalizer {
    pub fn normalize_and_hash_email(email: &str) -> String {
        let trimmed = email.trim().to_lowercase();
        let parts: Vec<&str> = trimmed.split('@').collect();
        if parts.len() != 2 {
            return Self::sha256_hex(&trimmed);
        }

        let mut username = parts[0].to_string();
        let domain = parts[1];

        // Google / Gmail specific normalization rules: strip dots and +alias
        if domain == "gmail.com" || domain == "googlemail.com" {
            username = username.replace('.', "");
            if let Some(idx) = username.find('+') {
                username = username[..idx].to_string();
            }
        }

        let normalized = format!("{}@{}", username, domain);
        Self::sha256_hex(&normalized)
    }

    pub fn normalize_and_hash_phone(phone: &str) -> String {
        let mut digits = String::new();
        let has_plus = phone.trim().starts_with('+');
        for c in phone.chars() {
            if c.is_ascii_digit() {
                digits.push(c);
            }
        }
        let e164 = if has_plus {
            format!("+{}", digits)
        } else {
            digits
        };
        Self::sha256_hex(&e164)
    }

    fn sha256_hex(input: &str) -> String {
        format!("{:x}", Sha256::digest(input.as_bytes()))
    }
}
