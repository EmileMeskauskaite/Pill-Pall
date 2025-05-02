const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

const getTable = (type) => {
  if (type === 'caretaker') {return 'caretakers';}
    else {return 'users';}
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
      subject: 'Patvirtinkite savo paskyrą',
      html: `<p>Sveiki,</p><p>Prašome patvirtinti savo paskyrą:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
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
      throw new Error("Naudotojas jau pridėtas arba laukia patvirtinimo.");
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
      subject: 'Globėjo prieigos patvirtinimas',
      html: `<p>Jūs buvote pakviestas susieti savo paskyrą su globėju.</p>
             <p>${caretakerName} ${caretakerSurname} nori susieti savo paskyrą su jūsų. Spustelėkite žemiau esančią nuorodą, kad patvirtintumėte:</p>
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
  },

  generatePasswordResetToken: (userId, type) => {
    return jwt.sign({ userId, type }, SECRET, { expiresIn: '1h' });
  },
  
  sendPasswordResetEmail: (email, token, transporter, type = 'user') => {
    const resetUrl = `http://localhost:5173/reset-password/${type}/password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Slaptažodžio atstatymo užklausa',
      html: `<p>Jūs pateikėte prašymą atstatyti slaptažodį. Spustelėkite žemiau esančią nuorodą, kad tai atliktumėte:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    };
    return transporter.sendMail(mailOptions);
  },  
  
  updatePassword: async (userId, newPasswordHash, type = 'user') => {
    const table = getTable(type);
    const [result] = await db.query(
      `UPDATE ${table} SET password = ? WHERE id = ?`,
      [newPasswordHash, userId]
    );
    return result.affectedRows > 0;
  },

  updateUser: async (id, updateData, type = 'user') => {
    const table = getTable(type);
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    const [result] = await db.query(
      `UPDATE ${table} SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    return result.affectedRows > 0;
  },

  deleteUser: async (id, type = 'user') => {
    const table = getTable(type);
    const [result] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },
};
