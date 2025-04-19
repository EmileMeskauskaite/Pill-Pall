const express = require("express");
const UsersController = require("../controllers/UsersController");

const router = express.Router();
router.post("/register", UsersController.registerUser);
router.get("/confirm", UsersController.confirm);
router.get("/confirm-caretaker", UsersController.confirmCaretakerUser);
router.post("/login", UsersController.loginUser);
router.post("/caretaker/register", UsersController.registerCaretaker);
router.post("/caretaker/login", UsersController.loginCaretaker);
router.post("/request-password-reset", UsersController.requestPasswordReset);
router.post("/reset-password", UsersController.resetPassword);

router.get("/caretaker/:caretakerId/users", UsersController.getCaretakerUsers);
router.post("/caretaker/add-user", UsersController.sendCaretakerConfirmation);
router.delete("/caretaker/remove-user", UsersController.removeUserFromCaretaker)
router.get("/caretaker/user-data/:caretakerId/:userId", UsersController.getUserDataForCaretaker);
module.exports = router;
