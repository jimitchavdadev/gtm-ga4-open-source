use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TagQualityStatus {
    Excellent,
    Good,
    NeedsAttention,
    Urgent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticIssue {
    pub rule_id: String,
    pub severity: String, // "critical" | "warning" | "recommendation"
    pub message: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagDiagnosticsReport {
    pub status: TagQualityStatus,
    pub issues_count: usize,
    pub issues: Vec<DiagnosticIssue>,
}

pub struct TagDiagnosticsEngine;

impl TagDiagnosticsEngine {
    pub fn evaluate_container(
        has_config_tag: bool,
        has_conversion_linker: bool,
        has_conversions: bool,
        has_legacy_tags: bool,
        duplicate_config_count: usize,
    ) -> TagDiagnosticsReport {
        let mut issues = Vec::new();

        if !has_config_tag {
            issues.push(DiagnosticIssue {
                rule_id: "MISSING_GOOGLE_TAG".into(),
                severity: "critical".into(),
                message: "No Google Tag (gtag.js / GA4 Configuration) found in container".into(),
                recommendation: "Add a Google Tag with your GA4 Measurement ID".into(),
            });
        }

        if has_conversions && !has_conversion_linker {
            issues.push(DiagnosticIssue {
                rule_id: "MISSING_CONVERSION_LINKER".into(),
                severity: "critical".into(),
                message: "Conversion tracking tags are present without a Conversion Linker".into(),
                recommendation: "Add a Conversion Linker tag firing on all pages to ensure first-party cookie measurement".into(),
            });
        }

        if duplicate_config_count > 1 {
            issues.push(DiagnosticIssue {
                rule_id: "DUPLICATE_CONFIG".into(),
                severity: "warning".into(),
                message: format!("Multiple ({}) configuration tags detected for the same ID", duplicate_config_count),
                recommendation: "Consolidate into a single Google Tag to avoid duplicate hit emissions".into(),
            });
        }

        if has_legacy_tags {
            issues.push(DiagnosticIssue {
                rule_id: "LEGACY_TAG_DETECTED".into(),
                severity: "warning".into(),
                message: "Container contains legacy Universal Analytics tags".into(),
                recommendation: "Upgrade legacy tags to modern GA4 event tags".into(),
            });
        }

        let status = if issues.iter().any(|i| i.severity == "critical") {
            TagQualityStatus::Urgent
        } else if issues.iter().any(|i| i.severity == "warning") {
            TagQualityStatus::NeedsAttention
        } else if !issues.is_empty() {
            TagQualityStatus::Good
        } else {
            TagQualityStatus::Excellent
        };

        TagDiagnosticsReport {
            status,
            issues_count: issues.len(),
            issues,
        }
    }
}
