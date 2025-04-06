const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Klaida prisijungiant prie duomenų bazės:', err);
    return;
  }
  console.log('Pavyko prisijungti prie MySQL!');
});

// Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// REGISTRATION + EMAIL VERIFICATION
app.post('/register', async (req, res) => {
  const { name, email, surname, password, date_of_birth } = req.body;

  if (!name || !email || !surname || !password || !date_of_birth) {
    return res.status(400).send('All fields must be filled');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).send('Error checking email');
      if (results.length > 0) return res.status(409).send({ message: 'Email already exists' });

      const sql = `
        INSERT INTO users (name, email, surname, password, date_of_birth, confirmed)
        VALUES (?, ?, ?, ?, ?, false)
      `;
      db.query(sql, [name, email, surname, hashedPassword, date_of_birth], (err, result) => {
        if (err) return res.status(500).send('Error creating user');

        const userId = result.insertId;
        const token = jwt.sign({ userId }, SECRET, { expiresIn: '2h' });

        const confirmUrl = `http://localhost:5169/confirm?x=${token}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Confirm your account',
          html: `<p>Hello,</p><p>Please confirm your account:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Failed to send email:', err);
            return res.status(500).send('Could not send confirmation email');
          }

          res.status(201).send({ message: 'Account created. Check your email.' });
        });
      });
    });
  } catch (err) {
    console.error('Hash error:', err);
    res.status(500).send('Server error');
  }
});

app.get('/confirm', (req, res) => {
  const token = req.query.x;

  if (!token) return res.status(400).send('Token missing');

  try {
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;

    db.query('UPDATE users SET confirmed = true WHERE id = ?', [userId], (err, result) => {
      if (err) return res.status(500).send('Error confirming user');
      if (result.affectedRows === 0) return res.status(404).send('User not found');

      return res.redirect('http://localhost:5173/');
    });
  } catch (err) {
    console.error('Token error:', err);
    return res.status(400).send('Invalid or expired token');
  }
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).send('Error finding user');
    if (results.length === 0) return res.status(401).send({ message: 'Invalid email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).send({ message: 'Invalid email or password' });

    if (!user.confirmed) {
      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '2h' });
      const confirmUrl = `http://localhost:5169/confirm?x=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Confirm your account',
        html: `<p>Hello,</p><p>Your account is not confirmed yet. Click below:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending confirmation email:', err);
          return res.status(500).send('Could not resend confirmation email');
        }

        return res.status(403).send({ message: 'Account not confirmed. A new email has been sent.' });
      });

      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '2h' });
    res.send({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

// CREATE MEDICINE
app.post('/medicines/create', authenticateToken, (req, res) => {
  const {
    medicine_name,
    strength,
    amount,
    times_per_day,
    start_date,
    end_date,
    timezone,
    reminder_minutes_before,
    send_email_reminder,
    repeat_type,
    days_of_week,
    interval_days,
    cycle_on_days,
    cycle_off_days,
    notes
  } = req.body;

  const user_id = req.user.id;

  const sql = `
    INSERT INTO medicines (
      user_id, medicine_name, strength, amount, times_per_day, start_date, end_date,
      timezone, reminder_minutes_before, send_email_reminder, repeat_type, 
      days_of_week, interval_days, cycle_on_days, cycle_off_days, notes, taken
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      medicine_name,
      strength,
      amount,
      JSON.stringify(times_per_day),
      start_date,
      end_date,
      timezone,
      reminder_minutes_before,
      send_email_reminder,
      repeat_type,
      JSON.stringify(days_of_week),
      interval_days,
      cycle_on_days,
      cycle_off_days,
      notes,
      false
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting medicine:', err);
        return res.status(500).send('Failed to insert medicine');
      }
      res.status(201).send({ message: 'Medicine saved successfully', id: result.insertId });
    }
  );
});

// GET USER MEDICINES
app.post('/medicines', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    'SELECT * FROM medicines WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching medicines:', err);
        return res.status(500).send('Could not fetch medicines');
      }

      const safeParse = (data) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          return [];
        }
      };

      const mapped = results.map((med) => ({
        ...med,
        times_per_day: safeParse(med.times_per_day),
        days_of_week: safeParse(med.days_of_week),
      }));

      res.json(mapped);
    }
  );
});

// MARK AS TAKEN
app.put('/medicines/:id/taken', authenticateToken, (req, res) => {
  const medicineId = req.params.id;
  const userId = req.user.id;

  db.query(
    'SELECT * FROM medicines WHERE id = ? AND user_id = ?',
    [medicineId, userId],
    (err, results) => {
      if (err) return res.status(500).send('Error fetching medicine');
      if (results.length === 0) return res.status(404).send('Medicine not found or access denied');

      db.query(
        'UPDATE medicines SET taken = true WHERE id = ?',
        [medicineId],
        (err) => {
          if (err) return res.status(500).send('Error updating status');
          res.send({ message: 'Medicine marked as taken' });
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`Serveris veikia http://localhost:${port}`);
});
