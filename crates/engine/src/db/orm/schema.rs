pub struct RawEventsTable;

impl RawEventsTable {
    pub const NAME: &'static str = "raw_events";
    pub const PROPERTY_ID: &'static str = "property_id";
    pub const STREAM_ID: &'static str = "stream_id";
    pub const CLIENT_ID: &'static str = "client_id";
    pub const USER_ID: &'static str = "user_id";
    pub const SESSION_ID: &'static str = "session_id";
    pub const SESSION_NUMBER: &'static str = "session_number";
    pub const EVENT_NAME: &'static str = "event_name";
    pub const TIMESTAMP_MICROS: &'static str = "timestamp_micros";
    pub const EVENT_PARAMS_JSON: &'static str = "event_params_json";
    pub const USER_PROPERTIES_JSON: &'static str = "user_properties_json";
    pub const CONSENT_STATE: &'static str = "consent_state";
    pub const CONSENT_DETAIL: &'static str = "consent_detail";
    pub const IS_CONVERSION: &'static str = "is_conversion";
    pub const IS_MODELED: &'static str = "is_modeled";
}

pub struct GtmEntitiesTable;

impl GtmEntitiesTable {
    pub const NAME: &'static str = "gtm_entities";
    pub const ID: &'static str = "id";
    pub const WORKSPACE_ID: &'static str = "workspace_id";
    pub const ENTITY_TYPE: &'static str = "entity_type";
    pub const NAME_COL: &'static str = "name";
    pub const DATA_JSON: &'static str = "data_json";
    pub const FINGERPRINT: &'static str = "fingerprint";
}

pub struct GtmVersionsTable;

impl GtmVersionsTable {
    pub const NAME: &'static str = "gtm_versions";
    pub const ID: &'static str = "id";
    pub const CONTAINER_ID: &'static str = "container_id";
    pub const NAME_COL: &'static str = "name";
    pub const DESCRIPTION: &'static str = "description";
    pub const ENTITIES_JSON: &'static str = "entities_json";
    pub const CREATED_AT: &'static str = "created_at";
}

pub struct AnnotationsTable;

impl AnnotationsTable {
    pub const NAME: &'static str = "annotations";
    pub const ID: &'static str = "id";
    pub const PROPERTY_ID: &'static str = "property_id";
    pub const TITLE: &'static str = "title";
    pub const DESCRIPTION: &'static str = "description";
    pub const DATE: &'static str = "date";
    pub const COLOR: &'static str = "color";
    pub const CREATED_AT: &'static str = "created_at";
}
