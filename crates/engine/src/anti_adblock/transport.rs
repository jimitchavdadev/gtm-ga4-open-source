pub struct TransportResilience;

impl TransportResilience {
    /// 1x1 transparent GIF binary bytes for image pixel fallback
    pub fn transparent_gif_bytes() -> &'static [u8] {
        &[
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
            0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
            0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
            0x01, 0x00, 0x3b,
        ]
    }

    /// Generates browser-side JavaScript fallback code snippet for custom endpoints
    /// Tries Beacon -> Fetch (keepalive) -> Pixel Image with dynamic ?fmt=gif
    pub fn client_transport_script(endpoint: &str) -> String {
        format!(
            r#"(function(url, data) {{
  var payload = JSON.stringify(data);
  if (navigator.sendBeacon && navigator.sendBeacon(url, payload)) return;
  fetch(url, {{ method: 'POST', body: payload, keepalive: true, headers: {{ 'Content-Type': 'application/json' }} }})
    .catch(function() {{
      var img = new Image();
      var fallbackUrl = url.indexOf('?') > -1 ? url + '&fmt=gif' : url + '?fmt=gif';
      img.src = fallbackUrl + '&d=' + encodeURIComponent(btoa(payload));
    }});
}})('{}', {{}})"#,
            endpoint
        )
    }
}
