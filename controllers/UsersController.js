// controllers/UsersController.js

const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const register = async (req, res) => {
  const { name, email, surname, password, date_of_birth } = req.body;

  if (!name || !email || !surname || !password || !date_of_birth) {
    return res.status(400).json({ error: "All fields must be filled." });
  }

  try {
    const emailExists = await Users.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await Users.registerUser(name, email, surname, hashedPassword, date_of_birth);

    const token = Users.generateEmailToken(userId);
    await Users.sendConfirmationEmail(email, token, transporter);

    res.status(201).json({ message: "Account created. Check your email." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

const confirm = async (req, res) => {
  const token = req.query.x;
  if (!token) return res.status(400).send("Token missing");

  try {
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;
    const confirmed = await Users.confirmUser(userId);

    if (!confirmed) {
      return res.status(404).send("User not found");
    }

    res.redirect("http://localhost:5173/");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid or expired token");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.confirmed) {
      return res.status(403).json({ error: "Please confirm your email before logging in." });
    }

    const match = await Users.checkPassword(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        date_of_birth: user.date_of_birth
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};


module.exports = {
  register,
  confirm,
  login
};
