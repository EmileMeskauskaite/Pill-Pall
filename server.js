const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./db')
const userRoutes = require('./routes/UsersRoutes')
const medicineRoutes = require('./routes/MedicinesRoutes')
const reminderRoutes = require('./routes/RemindersRoutes')

const { sendMedicineReminders } = require('./SendMedicineReminders');


const app = express();
const port = process.env.PORT;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Pill-Pall API is running' });
});

// Routes
app.use(userRoutes);
app.use(medicineRoutes);
app.use(reminderRoutes);

setInterval(sendMedicineReminders, 10 * 1000);


app.listen(port, '0.0.0.0', () => {
  console.log(`Serveris veikia http://localhost:${port}`);
});
