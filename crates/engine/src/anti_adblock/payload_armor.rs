pub struct PayloadArmor;

impl PayloadArmor {
    /// Disguises a raw payload string using a lightweight XOR cipher + Hex encoding
    /// Prevents regex matching on "en=purchase" or "tid=G-XXX" by content blockers
    pub fn disguise(payload: &str, key: u8) -> String {
        payload
            .as_bytes()
            .iter()
            .map(|b| format!("{:02x}", b ^ key))
            .collect()
    }

    /// Unpacks an armored hexadecimal string back to raw string
    pub fn reveal(armored_hex: &str, key: u8) -> Result<String, String> {
        if armored_hex.len() % 2 != 0 {
            return Err("Invalid hex string length".to_string());
        }

        let mut bytes = Vec::with_capacity(armored_hex.len() / 2);
        for i in (0..armored_hex.len()).step_by(2) {
            let byte_str = &armored_hex[i..i + 2];
            let byte = u8::from_str_radix(byte_str, 16)
                .map_err(|e| format!("Invalid hex byte: {}", e))?;
            bytes.push(byte ^ key);
        }

        String::from_utf8(bytes).map_err(|e| format!("Invalid UTF-8 payload: {}", e))
    }

    /// Checks if a payload is armored via a key indicator e.g. `__d=`
    pub fn is_armored_query(query_str: &str) -> bool {
        query_str.starts_with("__d=") || query_str.contains("&__d=")
    }

    /// Extracts and unpacks the armored parameter from query string if present
    pub fn extract_and_unpack(query_str: &str, key: u8) -> String {
        for part in query_str.split('&') {
            if let Some(stripped) = part.strip_prefix("__d=") {
                if let Ok(revealed) = Self::reveal(stripped, key) {
                    return revealed;
                }
            }
        }
        query_str.to_string()
    }
}
