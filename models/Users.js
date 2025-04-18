const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

const getTable = (type) => {
  if (type === 'user') return 'users';
  if (type === 'caretaker') return 'caretakers';
  throw new Error('Invalid type');
};

module.exports = {
  checkEmailExists: async (email, type = 'user') => {
    const table = getTable(type);
    const [rows] = await db.query(`SELECT id FROM ${table} WHERE email = ?`, [email]);
    return rows.length > 0;
  },

  registerUser: async (name, email, surname, password_hash, date_of_birth, type = 'user') => {
    const table = getTable(type);
    let sql, params;

    if (type === 'user') {
      sql = `INSERT INTO ${table} (name, email, surname, password, date_of_birth, confirmed)
             VALUES (?, ?, ?, ?, ?, false)`;
      params = [name, email, surname, password_hash, date_of_birth];
    } else {
      sql = `INSERT INTO ${table} (name, email, surname, password, confirmed)
             VALUES (?, ?, ?, ?, false)`;
      params = [name, email, surname, password_hash];
    }

    const [result] = await db.query(sql, params);
    return result.insertId;
  },

  getUserByEmail: async (email, type = 'user') => {
    const table = getTable(type);
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  getUserById: async (userId, type = 'user') => {
    const table = getTable(type);
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [userId]);
    return rows.length > 0 ? rows[0] : null;
  },

  confirmUser: async (id, type = 'user') => {
    const table = getTable(type);
    const [result] = await db.query(`UPDATE ${table} SET confirmed = true WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  generateEmailToken: (userId) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '2h' });
  },

  sendConfirmationEmail: (email, token, transporter, type = 'user') => {
    const confirmUrl = `http://localhost:5169/confirm?x=${token}&t=${type}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your account',
      html: `<p>Hello,</p><p>Please confirm your account:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
    };
    return transporter.sendMail(mailOptions);
  },

  checkPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  getCaretakersUsers: async (caretakerId) => {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.surname, u.email, u.date_of_birth, cu.confirmed
      FROM caretaker_users cu
      JOIN users u ON cu.user_id = u.id
      WHERE cu.caretaker_id = ?
    `, [caretakerId]);
    return rows;
  },

  createCaretakerUser: async (caretakerId, userId) => {
    const [rows] = await db.query(`
      SELECT * FROM caretaker_users
      WHERE caretaker_id = ? AND user_id = ?
    `, [caretakerId, userId]);
  
    if (rows.length > 0) {
      throw new Error("User already added or pending confirmation.");
    }
  
    const [result] = await db.query(`
      INSERT INTO caretaker_users (caretaker_id, user_id, confirmed)
      VALUES (?, ?, false)
    `, [caretakerId, userId]);
  
    return result.insertId;
  },

  removeCaretakerUser: async (caretakerId, userId) => {
    const [result] = await db.query(`
      DELETE FROM caretaker_users
      WHERE caretaker_id = ? AND user_id = ?
    `, [caretakerId, userId]);
    return result.affectedRows > 0;
  },

  generateCaretakerLinkToken: (caretakerId, userId) => {
    return jwt.sign({ caretakerId, userId }, SECRET, { expiresIn: '2h' });
  },

  sendCaretakerLinkEmail: (email, token, transporter, caretakerName, caretakerSurname) => {
    const confirmUrl = `http://localhost:5169/confirm-caretaker?x=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Caretaker Access Confirmation',
      html: `<p>You’ve been invited to connect with a caretaker.</p>
             <p>${caretakerName} ${caretakerSurname} wants to connect with your account. Click below to confirm:</p>
             <a href="${confirmUrl}">${confirmUrl}</a>`,
    };
    return transporter.sendMail(mailOptions);
  },

  confirmCaretakerUser: async (caretakerId, userId) => {
    const [result] = await db.query(`
      UPDATE caretaker_users
      SET confirmed = true
      WHERE caretaker_id = ? AND user_id = ?
    `, [caretakerId, userId]);
    return result.affectedRows > 0;
  },

  isCaretakerConfirmed: async (caretakerId, userId) => {
    const [rows] = await db.query(
      `SELECT confirmed FROM caretaker_users
       WHERE caretaker_id = ? AND user_id = ?`,
      [caretakerId, userId]
    );
  
    if (rows.length === 0) {
      return false;
    }
  
    return rows[0].confirmed === 1;
  }
};
