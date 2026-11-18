use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::RngCore;

pub struct FpidManager {
    key: [u8; 32],
}

impl FpidManager {
    pub fn new(secret_key: Option<&[u8; 32]>) -> Self {
        let key = match secret_key {
            Some(k) => *k,
            None => {
                let mut k = [0u8; 32];
                rand::thread_rng().fill_bytes(&mut k);
                k
            }
        };
        Self { key }
    }

    pub fn generate_fpid() -> String {
        let mut seed = [0u8; 16];
        rand::thread_rng().fill_bytes(&mut seed);
        let ts = chrono::Utc::now().timestamp();
        format!("FPID2.{}.{}", ts, hex::encode(seed))
    }

    pub fn encrypt(&self, fpid: &str) -> Result<String, String> {
        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .map_err(|e| format!("Cipher init error: {}", e))?;

        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, fpid.as_bytes())
            .map_err(|e| format!("Encryption error: {}", e))?;

        // Format: iv_hex.ciphertext_hex
        Ok(format!("{}.{}", hex::encode(nonce_bytes), hex::encode(ciphertext)))
    }

    pub fn decrypt(&self, token: &str) -> Result<String, String> {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 2 {
            return Err("Invalid token format, expected iv.ciphertext".to_string());
        }

        let nonce_bytes = hex::decode(parts[0])
            .map_err(|e| format!("Invalid nonce hex: {}", e))?;
        let ciphertext = hex::decode(parts[1])
            .map_err(|e| format!("Invalid ciphertext hex: {}", e))?;

        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .map_err(|e| format!("Cipher init error: {}", e))?;

        let nonce = Nonce::from_slice(&nonce_bytes);
        let decrypted_bytes = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|e| format!("Decryption error: {}", e))?;

        String::from_utf8(decrypted_bytes)
            .map_err(|e| format!("UTF-8 decode error: {}", e))
    }
}
