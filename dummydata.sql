-- SQLBook: Code
INSERT IGNORE INTO users (id, name, surname, email, password, date_of_birth, confirmed)
VALUES 
  (1, 'John', 'Doe', 'test@gmail.com', '$2b$10$zzrih6HjyMO6WXJ/5bLxdO4Y252CSx0jLcQB.YLTQR5yrYUs/.UiG', '1990-01-01', 1),
  (2, 'Jane', 'Smith', 'jane@example.com', '$2b$10$zzrih6HjyMO6WXJ/5bLxdO4Y252CSx0jLcQB.YLTQR5yrYUs/.UiG', '1985-06-15', 1);
INSERT IGNORE INTO medicines (id, user_id, medicine_name, strength, amount, notes)
VALUES 
  (1, 1, 'Amoxicillin', '500mg', '1 tablet', 'Take after meals'),
  (2, 1, 'Ibuprofen', '200mg', '2 tablets', 'Take with water, max 3 times a day'),
  (3, 1, 'Lisinopril', '10mg', '1 tablet', 'Take every morning, monitor blood pressure'),
  (4, 2, 'Metformin', '850mg', '1 tablet', 'Take with breakfast and dinner'),
  (5, 2, 'Atorvastatin', '20mg', '1 tablet', 'Take at bedtime to lower cholesterol');
INSERT IGNORE INTO reminder_rules (
  medicine_id, user_id, reminder_minutes_before,
  start_date, end_date, reminder_time, week_day
)
VALUES
(1, 1, 15, '2025-04-15', '2025-04-30', '08:00:00', 1),
(1, 1, 30, '2025-04-15', '2025-04-30', '20:00:00', 3),
(2, 1, 10, '2025-04-16', '2025-04-25', '07:30:00', 5);
INSERT IGNORE INTO reminders (reminder_date, reminder_rules_id)
VALUES 
('2025-04-07', 1),
('2025-04-14', 1),
('2025-04-21', 1),
('2025-04-28', 1),
('2025-04-16', 2),
('2025-04-23', 2),
('2025-04-18', 3),
('2025-04-25', 3);