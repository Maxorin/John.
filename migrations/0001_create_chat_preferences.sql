CREATE TABLE chat_preferences (
  chat_id TEXT PRIMARY KEY NOT NULL,
  preferences_json TEXT NOT NULL CHECK (json_valid(preferences_json)),
  updated_at TEXT NOT NULL
);

CREATE INDEX chat_preferences_updated_at_idx
  ON chat_preferences (updated_at DESC);
