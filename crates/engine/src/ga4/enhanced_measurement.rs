use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnhancedMeasurementConfig {
    pub scrolls: bool,
    pub outbound_clicks: bool,
    pub site_search: bool,
    pub video_engagement: bool,
    pub file_downloads: bool,
    pub form_interactions: bool,
    #[serde(default = "default_search_query_params")]
    pub search_query_parameters: Vec<String>,
}

fn default_search_query_params() -> Vec<String> {
    vec![
        "q".into(),
        "s".into(),
        "search".into(),
        "query".into(),
        "keyword".into(),
    ]
}

impl Default for EnhancedMeasurementConfig {
    fn default() -> Self {
        Self {
            scrolls: true,
            outbound_clicks: true,
            site_search: true,
            video_engagement: true,
            file_downloads: true,
            form_interactions: true,
            search_query_parameters: default_search_query_params(),
        }
    }
}

pub struct EnhancedMeasurementEvaluator;

impl EnhancedMeasurementEvaluator {
    pub fn is_file_download(url: &str) -> Option<(String, String)> {
        let clean = url.split('?').next().unwrap_or(url);
        let ext = clean.rsplit('.').next()?.to_lowercase();
        let download_extensions = [
            "pdf", "zip", "rar", "docx", "xlsx", "pptx", "txt", "csv", "exe", "mp3", "mp4",
        ];
        if download_extensions.contains(&ext.as_str()) {
            let filename = clean.rsplit('/').next().unwrap_or("unknown").to_string();
            Some((filename, ext))
        } else {
            None
        }
    }

    pub fn is_outbound_click(current_host: &str, target_url: &str) -> bool {
        if target_url.starts_with("http://") || target_url.starts_with("https://") {
            if let Some(target_host) = target_url.split('/').nth(2) {
                return !target_host.contains(current_host);
            }
        }
        false
    }

    pub fn extract_search_term(url: &str, query_params: &[String]) -> Option<String> {
        let query_part = url.split('?').nth(1)?;
        for pair in query_part.split('&') {
            let mut kv = pair.split('=');
            if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
                if query_params.iter().any(|p| p == k) {
                    let decoded_plus = v.replace('+', " ");
                    return Some(percent_encoding::percent_decode_str(&decoded_plus).decode_utf8_lossy().to_string());
                }
            }
        }
        None
    }
}
