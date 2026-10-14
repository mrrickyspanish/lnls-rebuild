-- Which lanes a subscriber wants: any of 'court', 'code', 'culture', 'home'.
-- NULL means every lane, which is what every existing subscriber keeps.
-- A story email goes to subscribers whose lanes include the story's lane
-- (its topic's family), plus everyone on NULL.
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS lanes TEXT[];

COMMENT ON COLUMN newsletter_subscribers.lanes IS 'Lanes picked at sign-up (court, code, culture, home). NULL = all lanes.';
