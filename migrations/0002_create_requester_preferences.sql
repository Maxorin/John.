CREATE TABLE requester_preferences (
  requester_key TEXT PRIMARY KEY NOT NULL,
  telegram_user_id TEXT,
  telegram_handle TEXT,
  preferences_json TEXT NOT NULL CHECK (json_valid(preferences_json)),
  updated_at TEXT NOT NULL
);

CREATE INDEX requester_preferences_updated_at_idx
  ON requester_preferences (updated_at DESC);
