const express = require("express");
const UsersController = require("../controllers/UsersController");

const router = express.Router();

router.post("/register", UsersController.register);
router.get("/confirm", UsersController.confirm);
router.post("/login", UsersController.login);

module.exports = router;
