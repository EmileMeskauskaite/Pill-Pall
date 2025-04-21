const express = require("express");
const RemindersController = require("../controllers/RemindersController");
const tokenVerification = require("../tokenVerification");
const { verify } = require("jsonwebtoken");
const router = express.Router();

router.get("/:userId/rules", tokenVerification.verifyUser, RemindersController.getAllRules);
router.get("/:userId/rules/:reminderId", tokenVerification.verifyUser, RemindersController.getOneRule);
router.put("/:userId/rules/:reminderId", tokenVerification.verifyUser, RemindersController.updateRule);
router.delete("/:userId/rules/:reminderId", tokenVerification.verifyUser, RemindersController.deleteRule);
router.delete("/:userId/rules", tokenVerification.verifyUser, RemindersController.deleteMultipleRules);
router.post("/:userId/rules", tokenVerification.verifyUser, RemindersController.createRule);

// Actual reminders
router.get("/:userId/reminder/:reminderId/medicine-name", tokenVerification.verifyUser, RemindersController.getMedicineNameFromReminderId);
router.get("/:userId/reminders", tokenVerification.verifyUser, RemindersController.getAllReminders);
router.put("/:userId/:reminderId/reminders", tokenVerification.verifyUser, RemindersController.updateTakenStatus);
router.get("/:userId/reminders/:medicineId", tokenVerification.verifyUser, RemindersController.getRulesByMedicineId);   
module.exports = router;
