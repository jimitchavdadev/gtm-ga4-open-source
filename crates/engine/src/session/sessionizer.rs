use std::collections::HashMap;

pub const DEFAULT_SESSION_TIMEOUT_SECS: i64 = 1800; // 30 minutes

#[derive(Debug, Clone)]
pub struct ActiveSession {
    pub session_id: i64,
    pub session_number: i64,
    pub start_time: i64,
    pub last_hit_time: i64,
    pub event_count: u32,
    pub is_engaged: bool,
    pub engagement_time_msec: i64,
}

pub struct Sessionizer {
    timeout_secs: i64,
    sessions: HashMap<String, ActiveSession>,
    user_session_counts: HashMap<String, i64>,
}

impl Default for Sessionizer {
    fn default() -> Self {
        Self::new(DEFAULT_SESSION_TIMEOUT_SECS)
    }
}

impl Sessionizer {
    pub fn new(timeout_secs: i64) -> Self {
        Self {
            timeout_secs,
            sessions: HashMap::new(),
            user_session_counts: HashMap::new(),
        }
    }

    pub fn process_hit(
        &mut self,
        client_id: &str,
        timestamp_secs: i64,
        is_conversion: bool,
        engagement_msec: Option<i64>,
    ) -> (i64, i64, bool) {
        let is_expired = if let Some(sess) = self.sessions.get(client_id) {
            (timestamp_secs - sess.last_hit_time) > self.timeout_secs
        } else {
            true
        };

        if is_expired {
            let next_num = self.user_session_counts.entry(client_id.to_string()).or_insert(0);
            *next_num += 1;
            let current_num = *next_num;
            let session_id = timestamp_secs;

            let sess = ActiveSession {
                session_id,
                session_number: current_num,
                start_time: timestamp_secs,
                last_hit_time: timestamp_secs,
                event_count: 1,
                is_engaged: is_conversion,
                engagement_time_msec: engagement_msec.unwrap_or(0),
            };
            self.sessions.insert(client_id.to_string(), sess);
            (session_id, current_num, true)
        } else {
            let sess = self.sessions.get_mut(client_id).unwrap();
            sess.last_hit_time = timestamp_secs;
            sess.event_count += 1;
            if let Some(et) = engagement_msec {
                sess.engagement_time_msec += et;
            }

            if is_conversion || sess.engagement_time_msec >= 10_000 || sess.event_count >= 2 {
                sess.is_engaged = true;
            }

            (sess.session_id, sess.session_number, false)
        }
    }

    pub fn is_session_engaged(&self, client_id: &str) -> bool {
        self.sessions.get(client_id).map(|s| s.is_engaged).unwrap_or(false)
    }
}
