const express = require("express");
const UsersController = require("../controllers/UsersController");
const tokenVerification = require("../tokenVerification");
const router = express.Router();
router.post("/register", UsersController.registerUser);
router.get("/confirm", UsersController.confirm);
router.get("/confirm-caretaker", UsersController.confirmCaretakerUser);
router.post("/login", UsersController.loginUser);
router.post("/caretaker/register", UsersController.registerCaretaker);
router.post("/caretaker/login", UsersController.loginCaretaker);
router.post("/request-password-reset", UsersController.requestPasswordReset);
router.post("/reset-password", UsersController.resetPassword);



router.get("/caretaker/:caretakerId/users",tokenVerification.verifyCaretaker, UsersController.getCaretakerUsers);
router.post("/:caretakerId/caretaker/add-user", tokenVerification.verifyCaretaker, UsersController.sendCaretakerConfirmation);
router.delete("/:caretakerId/caretaker/remove-user",tokenVerification.verifyCaretaker, UsersController.removeUserFromCaretaker)
router.get("/caretaker/user-data/:caretakerId/:userId",tokenVerification.verifyCaretaker, UsersController.getUserDataForCaretaker);

router.put("/user/:userId", tokenVerification.verifyUser, UsersController.updateUser);
router.put("/caretaker/:caretakerId",tokenVerification.verifyCaretaker, UsersController.updateCaretaker);

router.delete("/user/:userId", tokenVerification.verifyUser, UsersController.deleteUser);
router.delete("/caretaker/:caretakerId",tokenVerification.verifyCaretaker, UsersController.deleteCaretaker);

module.exports = router;
