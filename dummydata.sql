USE pillpal;
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