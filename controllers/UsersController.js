const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const Users = require("../models/Users");
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

// Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  register: async (req, res) => {
    let { name, email, surname, password, date_of_birth } = req.body;

    if (!name || !email || !surname || !password || !date_of_birth) {
      return res.status(400).json({ error: "All fields must be filled." });
    }

    try {
      // Check if the email already exists
      const emailExists = await Users.checkEmailExists(email);
      if (emailExists) {
        return res.status(409).json({ error: "Email already exists." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user
      const userId = await Users.registerUser(name, email, surname, hashedPassword, date_of_birth);

      // Generate email confirmation token
      const token = Users.generateEmailToken(userId, secret);

      // Send confirmation email
      await Users.sendConfirmationEmail(email, token, transporter);

      res.status(201).json({ message: "Account created. Check your email to confirm your account." });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Error creating user" });
    }
  },

  confirm: async (req, res) => {
    const token = req.query.x;

    if (!token) return res.status(400).send('Token missing');

    try {
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;

      const userConfirmed = await Users.confirmUser(userId);
      if (!userConfirmed) {
        return res.status(404).send('User not found');
      }

      return res.redirect('http://localhost:5173/');
    } catch (err) {
      console.error('Token error:', err);
      return res.status(400).send('Invalid or expired token');
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user
      const user = await Users.getUserByEmail(email);
      if (!user) {
        return res.status(401).send({ message: "Invalid email" });
      }

      // Check password
      if (!password){
        throw new Error("No password")
      }
      const match = await Users.checkPassword(password, user.password);
      if (!match) {
        return res.status(401).send({ message: "Invalid password" });
      }
      console.log("HELLOOOOOOOOOOOOOOOOOOOOO")
      console.log(user.email)
      // Resend confirmation email if not confirmed
      if (!user.confirmed) {
        const token = Users.generateEmailToken(user.id, secret);
        await Users.sendConfirmationEmail(user.email, token, transporter);
        return res.status(403).send({
          message: "Account not confirmed. A new email has been sent.",
        });
      }

      // Login token
      const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '2h' });

      return res.status(200).send({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).send("Error during login");
    }
  },
};