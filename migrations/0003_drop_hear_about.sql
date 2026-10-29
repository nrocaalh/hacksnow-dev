-- Hacker House — Snow Edition · drop the unused hear_about column
-- (the "how did you hear about us" question was removed from the form)
-- Apply with: wrangler d1 migrations apply <DB_NAME> --local   (dev)
--             wrangler d1 migrations apply <DB_NAME> --remote  (prod)

ALTER TABLE applications DROP COLUMN hear_about;
