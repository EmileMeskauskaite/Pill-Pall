CREATE DATABASE IF NOT EXISTS pillpal;
USE pillpal;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE
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
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  user_id INT NOT NULL,
  reminder_id INT,
  send_email_reminder BOOLEAN,
  taken BOOLEAN DEFAULT FALSE,
  reminder_minutes_before INT,
  start_date DATE,
  end_date DATE,
  reminder_time TIME,
  week_day INT,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)