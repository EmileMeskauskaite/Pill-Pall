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
router.post("/:caretakerId/caretaker/add-user", UsersController.sendCaretakerConfirmation);
router.delete("/:caretakerId/caretaker/remove-user", UsersController.removeUserFromCaretaker)
router.get("/caretaker/user-data/:caretakerId/:userId", UsersController.getUserDataForCaretaker);

router.put("/user/:userId", UsersController.updateUser);
router.put("/caretaker/:caretakerId", UsersController.updateCaretaker);

router.delete("/user/:userId", UsersController.deleteUser);
router.delete("/caretaker/:caretakerId", UsersController.deleteCaretaker);

module.exports = router;
