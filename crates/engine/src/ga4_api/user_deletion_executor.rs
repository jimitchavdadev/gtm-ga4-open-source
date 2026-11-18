use crate::db::pool::DatabasePool;
use rusqlite::params;

pub struct UserDeletionExecutor;

impl UserDeletionExecutor {
    /// Executes GDPR/CCPA user deletion across events matching user_id or client_id
    pub fn purge_user_events(
        pool: &DatabasePool,
        property_id: &str,
        client_id: Option<&str>,
        user_id: Option<&str>,
    ) -> Result<usize, String> {
        if client_id.is_none() && user_id.is_none() {
            return Err("At least one of client_id or user_id must be provided for user deletion".into());
        }

        pool.with_conn(|conn| {
            let cid = client_id.unwrap_or("");
            let uid = user_id.unwrap_or("");

            let count = conn.execute(
                r#"
                DELETE FROM raw_events
                WHERE property_id = ?1
                  AND (
                    (?2 != '' AND client_id = ?2)
                    OR
                    (?3 != '' AND user_id = ?3)
                  )
                "#,
                params![property_id, cid, uid],
            )?;

            Ok(count)
        }).map_err(|e| e.to_string())
    }
}
