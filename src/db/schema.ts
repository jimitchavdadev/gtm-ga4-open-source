export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  share_data INTEGER NOT NULL DEFAULT 0,
  gmp_org_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS containers (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  public_id TEXT NOT NULL UNIQUE,
  usage_context TEXT NOT NULL, -- WEB, SERVER, IOS, ANDROID, AMP
  is_360 INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  container_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS container_entities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- TAG, TRIGGER, VARIABLE, TEMPLATE, ZONE
  name TEXT NOT NULL,
  data_json TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS container_versions (
  id TEXT PRIMARY KEY,
  container_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  snapshot_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL, -- PENDING, APPROVED, REJECTED
  requested_by TEXT NOT NULL,
  reviewed_by TEXT,
  comments_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ga4_properties (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_360 INTEGER NOT NULL DEFAULT 0,
  data_retention_months INTEGER NOT NULL DEFAULT 14,
  parent_property_id TEXT, -- for subproperties
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ga4_data_streams (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  stream_type TEXT NOT NULL, -- WEB, IOS, ANDROID
  display_name TEXT NOT NULL,
  measurement_id TEXT NOT NULL UNIQUE,
  api_secret TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (property_id) REFERENCES ga4_properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS raw_events (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  stream_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  user_id TEXT,
  session_id INTEGER NOT NULL,
  timestamp_micros INTEGER NOT NULL,
  event_params_json TEXT NOT NULL,
  user_properties_json TEXT,
  items_json TEXT,
  consent_json TEXT,
  is_conversion INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (property_id) REFERENCES ga4_properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  session_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  start_timestamp INTEGER NOT NULL,
  last_timestamp INTEGER NOT NULL,
  engagement_time_ms INTEGER NOT NULL DEFAULT 0,
  page_view_count INTEGER NOT NULL DEFAULT 0,
  has_key_event INTEGER NOT NULL DEFAULT 0,
  is_engaged INTEGER NOT NULL DEFAULT 0,
  traffic_source_json TEXT,
  FOREIGN KEY (property_id) REFERENCES ga4_properties(id) ON DELETE CASCADE
);
`;
