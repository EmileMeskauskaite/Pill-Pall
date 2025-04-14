const express = require("express");
const RemindersController = require("../controllers/RemindersController");

const router = express.Router();

router.get("/:userId/reminders", RemindersController.getAll);
router.get("/:userId/reminders/:reminderId", RemindersController.getOne);
router.post("/reminders", RemindersController.create);
router.put("/:userId/reminders/:reminderId", RemindersController.update);
router.delete("/:userId/reminders/:reminderId", RemindersController.delete);
router.delete("/:userId/reminders", RemindersController.deleteMultiple);

module.exports = router;
