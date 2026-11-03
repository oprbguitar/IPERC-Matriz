-- Estado de cumplimiento por usuario: perfil de organizacion y obligaciones acreditadas.
-- No contiene datos de salud individuales.
CREATE TABLE IF NOT EXISTS org_compliance (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_json TEXT NOT NULL,
  entries_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
