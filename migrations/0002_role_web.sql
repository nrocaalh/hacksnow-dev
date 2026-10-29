-- Hacker House — Snow Edition · role + web/LinkedIn fields
-- Apply with: wrangler d1 migrations apply <DB_NAME> --local   (dev)
--             wrangler d1 migrations apply <DB_NAME> --remote  (prod)

ALTER TABLE applications ADD COLUMN role       TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN role_other TEXT;
ALTER TABLE applications ADD COLUMN web        TEXT;
