use super::model::CanonicalEvent;

pub struct WireParser;

impl WireParser {
    pub fn parse_query_hit(query_or_body: &str) -> Vec<CanonicalEvent> {
        let lines: Vec<&str> = query_or_body.split('\n').filter(|l| !l.trim().is_empty()).collect();
        lines.into_iter().map(Self::parse_single_line).collect()
    }

    pub fn parse_single_line(line: &str) -> CanonicalEvent {
        let mut event = CanonicalEvent::default();
        let query_str = line.strip_prefix('?').unwrap_or(line);

        for pair in query_str.split('&') {
            if pair.is_empty() {
                continue;
            }
            let mut kv = pair.splitn(2, '=');
            let key = kv.next().unwrap_or("");
            let val = kv.next().unwrap_or("");
            let decoded_val = urlencoding_decode(val);

            match key {
                "en" => event.event_name = decoded_val,
                "tid" => {
                    event.event_params.insert("tid".to_string(), serde_json::Value::String(decoded_val));
                }
                "cid" => event.client_id = decoded_val,
                "uid" => event.user_id = Some(decoded_val),
                "dl" => event.page_location = Some(decoded_val),
                "dr" => event.page_referrer = Some(decoded_val),
                "dt" => event.page_title = Some(decoded_val),
                "uip" => event.ip_override = Some(decoded_val),
                "ua" => event.user_agent = Some(decoded_val),
                "gcs" => event.consent_state = Some(decoded_val),
                "gcd" => event.consent_detail = Some(decoded_val),
                "_sno" => {
                    if let Ok(num) = decoded_val.parse::<i64>() {
                        event.session_number = Some(num);
                    }
                }
                "_et" => {
                    if let Ok(ms) = decoded_val.parse::<i64>() {
                        event.engagement_time_msec = Some(ms);
                    }
                }
                "_ss" => {
                    event.event_params.insert("session_start".to_string(), serde_json::Value::Bool(true));
                }
                k if k.starts_with("ep.") => {
                    let param_name = &k[3..];
                    event.event_params.insert(param_name.to_string(), serde_json::Value::String(decoded_val));
                }
                k if k.starts_with("epn.") => {
                    let param_name = &k[4..];
                    if let Ok(num) = decoded_val.parse::<f64>() {
                        event.event_params.insert(
                            param_name.to_string(),
                            serde_json::Number::from_f64(num)
                                .map(serde_json::Value::Number)
                                .unwrap_or(serde_json::Value::Null),
                        );
                    }
                }
                k if k.starts_with("up.") => {
                    let prop_name = &k[3..];
                    event.user_properties.insert(prop_name.to_string(), serde_json::Value::String(decoded_val));
                }
                k if k.starts_with("upn.") => {
                    let prop_name = &k[4..];
                    if let Ok(num) = decoded_val.parse::<f64>() {
                        event.user_properties.insert(
                            prop_name.to_string(),
                            serde_json::Number::from_f64(num)
                                .map(serde_json::Value::Number)
                                .unwrap_or(serde_json::Value::Null),
                        );
                    }
                }
                _ => {}
            }
        }

        if let Some(sid_val) = event.event_params.get("session_id") {
            if let Some(s) = sid_val.as_str() {
                event.session_id = s.parse::<i64>().ok();
            } else if let Some(n) = sid_val.as_i64() {
                event.session_id = Some(n);
            }
        }

        if event.event_name == "purchase" || event.event_name == "generate_lead" {
            event.is_conversion = true;
        }

        event
    }
}

fn urlencoding_decode(val: &str) -> String {
    let replaced = val.replace('+', " ");
    percent_encoding::percent_decode_str(&replaced)
        .decode_utf8_lossy()
        .into_owned()
}
