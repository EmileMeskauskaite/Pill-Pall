-- SQLBook: Code
CREATE DATABASE IF NOT EXISTS pillpal;
CREATE TABLE IF NOT EXISTS caretakers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS caretaker_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caretaker_id INT NOT NULL,
  user_id INT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (caretaker_id) REFERENCES caretakers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  strength VARCHAR(100),
  amount VARCHAR(100),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reminder_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  user_id INT NOT NULL,
  reminder_minutes_before INT,
  start_date DATE,
  end_date DATE,
  reminder_time TIME,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reminder_week_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reminder_rule_id INT NOT NULL,
  week_day INT NOT NULL,
  FOREIGN KEY (reminder_rule_id) REFERENCES reminder_rules(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reminder_date DATE NOT NULL,
  reminder_rules_id INT NOT NULL,
  sent_email BOOLEAN DEFAULT FALSE,
  taken BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (reminder_rules_id) REFERENCES reminder_rules(id) ON DELETE CASCADE
);