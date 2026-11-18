use sha2::{Digest, Sha256};

pub fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn hash_client_id(cid: &str) -> String {
    sha256_hex(cid)
}

pub fn hash_user_property(prop: &str) -> String {
    sha256_hex(prop)
}
