use regex::Regex;
use std::sync::LazyLock;

static EMAIL_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)[a-zA-Z0-9._%+-]+(?:@|%40)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}").unwrap()
});

pub fn redact_emails(text: &str) -> String {
    EMAIL_REGEX.replace_all(text, "(redacted)").into_owned()
}

pub fn contains_email(text: &str) -> bool {
    EMAIL_REGEX.is_match(text)
}
