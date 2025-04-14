const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./db')
const userRoutes = require('./routes/UsersRoutes')
const medicineRoutes = require('./routes/MedicinesRoutes')
const reminderRoutes = require('./routes/RemindersRoutes')

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
app.use(userRoutes);
app.use(medicineRoutes);
app.use(reminderRoutes);

app.listen(port, () => {
  console.log(`Serveris veikia http://localhost:${port}`);
});
