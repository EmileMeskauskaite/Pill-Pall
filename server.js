const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./db')
const routes = require('./routes/UsersRoutes')

const app = express();
const port = process.env.PORT;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use(routes);

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
