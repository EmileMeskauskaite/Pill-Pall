const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT; 
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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


app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Klaida vykdant užklausą:', err);
      res.status(500).send('Įvyko klaida');
      return;
    }
    res.json(results);
  });
});

app.post('/register', async (req, res) => {
  const { name, email, surname, password, date_of_birth } = req.body;

  if (!name || !email || !surname || !password || !date_of_birth) {
    return res.status(400).send('Visi laukeliai turi būti užpildyti');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Klaida tikrinant el. paštą:', err);
        return res.status(500).send('Įvyko klaida');
      }

      if (results.length > 0) {
        return res.status(409).send({ message: 'Toks el. paštas jau egzistuoja' });
      }

      db.query(
        'INSERT INTO users (name, email, surname, password, date_of_birth) VALUES (?, ?, ?, ?, ?)',
        [name, email, surname, hashedPassword, date_of_birth],
        (err, results) => {
          if (err) {
            console.error('Klaida kuriant vartotoją:', err);
            return res.status(500).send('Įvyko klaida');
          }

          res.status(201).send({ message: 'Vartotojas sukurtas!', id: results.insertId });
        }
      );
    });
  } catch (err) {
    console.error('Hash klaida:', err);
    res.status(500).send('Įvyko klaida');
  }
});



app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Klaida ieškant vartotojo:', err);
      return res.status(500).send('Įvyko klaida');
    }

    if (results.length === 0) {
      return res.status(401).send({ message: 'Netinkamas el. paštas arba slaptažodis' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).send({ message: 'Netinkamas el. paštas arba slaptažodis' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: '2h' }
    );

    res.send({ message: 'Prisijungta sėkmingai', token });
  });
});


app.listen(port, () => {
  console.log(`Serveris veikia http://localhost:${port}`);
});
