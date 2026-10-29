-- Hacker House — Snow Edition · D1 applications table
-- Apply with: wrangler d1 migrations apply <DB_NAME> --local   (dev)
--             wrangler d1 migrations apply <DB_NAME> --remote  (prod)

CREATE TABLE IF NOT EXISTS applications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,           -- dedupe: one seat per email
  name         TEXT    NOT NULL,
  age          INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  github       TEXT,
  x            TEXT,
  ski_level    TEXT    NOT NULL,
  hear_about   TEXT    NOT NULL,
  ai_project   TEXT    NOT NULL,
  locale       TEXT    NOT NULL DEFAULT 'en',
  gdpr_consent INTEGER NOT NULL DEFAULT 1,        -- 1 = accepted
  consent_ts   TEXT,
  status       TEXT    NOT NULL DEFAULT 'applied',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at);
