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


const register = (type = 'user') => async (req, res) => {
  const { name, email, surname, password, date_of_birth } = req.body;

  if (!name || !email || !surname || !password || (type === 'user' && !date_of_birth)) {
    return res.status(400).json({ error: "All fields must be filled." });
  }

  try {
    const emailExists = await Users.checkEmailExists(email, type);
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await Users.registerUser(name, email, surname, hashedPassword, date_of_birth, type);

    const token = Users.generateEmailToken(userId);
    await Users.sendConfirmationEmail(email, token, transporter, type);

    res.status(201).json({ message: "Account created. Check your email." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

const confirm = async (req, res) => {
  // query.x & t are in confirmation token
  const token = req.query.x;
  const type = req.query.t || 'user';

  if (!token) return res.status(400).send("Token missing");

  try {
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;
    const confirmed = await Users.confirmUser(userId, type);

    if (!confirmed) return res.status(404).send("User not found");
    res.redirect("http://localhost:5173/");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid or expired token");
  }
};

const login = (type = 'user') => async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.getUserByEmail(email, type);
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
        ...(type === 'user' && { date_of_birth: user.date_of_birth })
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

const getCaretakerUsers = async (req, res) => {
  const { caretakerId } = req.params;
  
  try {
    const users = await Users.getCaretakersUsers(caretakerId);
    res.json(users);
  } catch (err) {
    console.error("Error fetching caretaker's users:", err);
    res.status(500).json({ error: "Could not retrieve users" });
  }
};

const removeUserFromCaretaker = async (req, res) => {
  const { caretakerId, userId } = req.body;

  try {
    const success = await Users.removeCaretakerUser(caretakerId, userId);
    if (!success) return res.status(404).json({ error: "User not found in caretaker list" });
    res.json({ message: "User removed" });
  } catch (err) {
    console.error("Error removing user:", err);
    res.status(500).json({ error: "Could not remove user" });
  }
};

const sendCaretakerConfirmation = async (req, res) => {
  const { caretakerId, userEmail, caretakerName, caretakerSurname } = req.body;
  let user;
  
  try {
    user = await Users.getUserByEmail(userEmail);
    if (user == null) {
      return res.status(400).json({ error: "User with such email does not exist." });
    } else if (user.confirmed === false) {
      return res.status(400).json({ error: "This user has not confirmed their email yet." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Issue with the server." });
  }

  try {
    await Users.createCaretakerUser(caretakerId, user.id);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const token = Users.generateCaretakerLinkToken(caretakerId, user.id);
    await Users.sendCaretakerLinkEmail(userEmail, token, transporter, caretakerName, caretakerSurname);
    return res.json({ message: "Confirmation email sent" });
  } catch (err) {
    console.error("Error sending caretaker confirmation:", err);
    return res.status(500).json({ error: "Could not send confirmation" });
  }
};

const confirmCaretakerUser = async (req, res) => {
  const token = req.query.x;
  if (!token) return res.status(400).send("Token missing");

  try {
    const { caretakerId, userId } = jwt.verify(token, SECRET);
    const success = await Users.confirmCaretakerUser(caretakerId, userId);
    if (!success) return res.status(404).send("Invalid confirmation");

    res.redirect("http://localhost:5173/");
  } catch (err) {
    console.error("Caretaker confirmation error:", err);
    res.status(400).send("Invalid or expired token");
  }
};

const getUserDataForCaretaker = async (req, res) => {
  const { caretakerId, userId } = req.params;

  try {
    const isConfirmed = await Users.isCaretakerConfirmed(caretakerId, userId);

    if (!isConfirmed) {
      return res.status(403).json({ error: "Caretaker access not confirmed for this user." });
    }

    const user = await Users.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, caretakerAccess: true },
      SECRET,
      { expiresIn: "1h" }
    );

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
    console.error("Error in getUserDataForCaretaker:", err);
    res.status(500).json({ error: "Failed to retrieve user data" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email, type = 'user' } = req.body;

  try {
    const user = await Users.getUserByEmail(email, type);
    if (!user) return res.status(404).json({ error: "User not found." });

    const token = Users.generatePasswordResetToken(user.id, type);
    await Users.sendPasswordResetEmail(email, token, transporter, type);

    res.json({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Reset email error:", err);
    res.status(500).json({ error: "Could not send password reset email." });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const success = await Users.updatePassword(decoded.userId, hashedPassword, decoded.type);
    if (!success) return res.status(404).json({ error: "User not found." });

    res.json({ message: "Password has been updated." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

module.exports = {
  registerUser: register("user"),
  registerCaretaker: register("caretaker"),
  loginUser: login("user"),
  loginCaretaker: login("caretaker"),
  confirm,
  getCaretakerUsers,
  removeUserFromCaretaker,
  sendCaretakerConfirmation,
  confirmCaretakerUser,
  getUserDataForCaretaker,
  requestPasswordReset,
  resetPassword,
};
