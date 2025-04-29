-- Create the reminder_week_days table
CREATE TABLE IF NOT EXISTS reminder_week_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reminder_rule_id INT NOT NULL,
  week_day INT NOT NULL,
  FOREIGN KEY (reminder_rule_id) REFERENCES reminder_rules(id) ON DELETE CASCADE
);

-- Migrate existing data from reminder_rules.week_day to reminder_week_days
INSERT INTO reminder_week_days (reminder_rule_id, week_day)
SELECT id, week_day FROM reminder_rules WHERE week_day IS NOT NULL;

-- Remove the week_day column from reminder_rules
ALTER TABLE reminder_rules DROP COLUMN week_day; 