const express = require("express");
const RemindersController = require("../controllers/RemindersController");

const router = express.Router();

router.get("/:userId/rules", RemindersController.getAllRules);
router.get("/:userId/rules/:reminderId", RemindersController.getOneRule);
router.put("/:userId/rules/:reminderId", RemindersController.updateRule);
router.delete("/:userId/rules/:reminderId", RemindersController.deleteRule);
router.delete("/:userId/rules", RemindersController.deleteMultipleRules);
router.post("/rules", RemindersController.createRule);

// Actual reminders
router.get("/:userId/reminders", RemindersController.getAllReminders);
router.put("/:reminderId/reminders", RemindersController.updateTakenStatus);
router.get("/reminders/:medicineId", RemindersController.getRulesByMedicineId);   
module.exports = router;
