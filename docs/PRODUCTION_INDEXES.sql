-- ConsentEase: production indexes for hot tables
-- Run this once against the production database (e.g. via the Replit DB
-- panel "Run SQL" tab on the production database, or psql).
--
-- These statements are idempotent (`IF NOT EXISTS`) and use `CONCURRENTLY`
-- so they will not lock writes while the indexes are being built.
-- CONCURRENTLY can NOT run inside a transaction — paste them one block at
-- a time if your client wraps everything in one.
--
-- After running this, the matching schema declarations live in
-- `shared/schema.ts` so any future `db:push` will be a no-op.

CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_events_website_timestamp_idx
  ON analytics_events (website_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_events_website_event_idx
  ON analytics_events (website_id, event_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS consent_logs_website_timestamp_idx
  ON consent_logs (website_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS consent_logs_visitor_idx
  ON consent_logs (visitor_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS web_vitals_website_timestamp_idx
  ON web_vitals_metrics (website_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS cookies_website_idx
  ON cookies (website_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS cookies_category_idx
  ON cookies (category_id);

-- Verification
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('analytics_events','consent_logs','web_vitals_metrics','cookies')
-- ORDER BY tablename, indexname;
