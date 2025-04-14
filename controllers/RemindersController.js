const Reminders = require("../models/Reminders");

module.exports = {
  getAll: async (req, res) => {
    try {
      const { userId } = req.params;
      const reminders = await Reminders.getAllReminderRulesForUser(userId);
      res.status(200).json(reminders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving reminders." });
    }
  },

  getOne: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const reminder = await Reminders.getReminderRuleById(userId, reminderId);
      if (!reminder)
        return res.status(404).json({ error: "Reminder not found." });
      res.status(200).json(reminder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving reminder." });
    }
  },

  create: async (req, res) => {
    try {
      const reminderData = req.body;
      const reminderId = await Reminders.createReminderRule(reminderData);
      res.status(201).json({ id: reminderId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating reminder." });
    }
  },

  update: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const updated = await Reminders.updateReminderRule(
        userId,
        reminderId,
        req.body
      );
      if (!updated)
        return res
          .status(404)
          .json({ error: "Reminder not found or not updated." });
      res.status(200).json({ message: "Reminder updated." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating reminder." });
    }
  },

  delete: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const deleted = await Reminders.deleteReminderRule(userId, reminderId);
      if (!deleted)
        return res
          .status(404)
          .json({ error: "Reminder not found or not deleted." });
      res.status(200).json({ message: "Reminder deleted." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminder." });
    }
  },

  deleteMultiple: async (req, res) => {
    try {
      const { userId } = req.params;
      let { ids } = req.body;

      // In case string
      if (typeof ids === "string") {
        try {
          ids = JSON.parse(ids);
        } catch (err) {
          return res.status(400).json({ error: "Invalid format for IDs." });
        }
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({
            error: "Provide an array or a string of reminder IDs to delete.",
          });
      }

      const deletedCount = await Reminders.deleteMultipleReminderRule(userId, ids);
      res.status(200).json({ message: `Deleted ${deletedCount} reminder(s).` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminders." });
    }
  },
};
