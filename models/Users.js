const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  checkEmailExists: async (email) => {
    try {
      const [response] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      return response.length > 0 ? true : false;
    } catch (err) {
      console.log(err);
      throw new Error("Error checking email in the database.");
    }
  },

  registerUser: async (name, email, surname, password_hash, date_of_birth) => {
    try {
      const result = await db.query(
        "INSERT INTO users (name, email, surname, password, date_of_birth, confirmed) VALUES (?, ?, ?, ?, ?, false)",
        [name, email, surname, password_hash, date_of_birth]
      );
      return result.insertId;
    } catch (err) {
      throw new Error("Error registering user.");
    }
  },

  generateEmailToken: (userId, secret) => {
    return jwt.sign({ userId }, secret, { expiresIn: '2h' });
  },
  
  sendConfirmationEmail: (email, token, transporter) => {
    const confirmUrl = `http://localhost:5169/confirm?x=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your account',
      html: `<p>Hello,</p><p>Please confirm your account:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
    };

    return transporter.sendMail(mailOptions);
  },

  confirmUser: async (userId) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET confirmed = true WHERE id = ?",
        [userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.log(err);
      throw new Error("Error confirming user.");
      
    }
  },

  checkPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  getUserByEmail: async (email) => {
    try {
      const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.log(err);
      throw new Error("Error finding user.");
    }
  },

};