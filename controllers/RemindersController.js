const Reminders = require("../models/Reminders");

module.exports = {
  getAllRules: async (req, res) => {
    try {
      const { userId } = req.params;
      const reminders = await Reminders.getAllReminderRulesForUser(userId);
      res.status(200).json(reminders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving reminders." });
    }
  },

  getOneRule: async (req, res) => {
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

  createRule: async (req, res) => {
    try {
      const reminderData = req.body;
      
      // Ensure week_days is an array
      const weekDays = reminderData.week_days || [];
      if (weekDays.length === 0) {
        return res.status(400).json({ error: "At least one week day must be selected" });
      }
      
      // Create the reminder rule
      const reminderId = await Reminders.createReminderRule({
        ...reminderData,
        week_days: weekDays
      });
      
      // Create reminders for each week day
      const reminders = await Reminders.createReminders(
        reminderId, 
        reminderData.start_date, 
        reminderData.end_date, 
        weekDays
      );
      
      res.status(201).json({ id: reminderId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating reminder." });
    }
  },

  updateRule: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const updateData = req.body;
      
      // Ensure week_days is an array
      const weekDays = updateData.week_days || [];
      if (weekDays.length === 0) {
        return res.status(400).json({ error: "At least one week day must be selected" });
      }
      
      // Update the reminder rule
      const updated = await Reminders.updateReminderRule(
        userId,
        reminderId,
        {
          ...updateData,
          week_days: weekDays
        }
      );
      
      if (!updated) {
        return res.status(404).json({ error: "Reminder not found or not updated." });
      }
      
      // Delete existing reminders and create new ones
      await Reminders.deleteRemindersByRuleId(reminderId);
      await Reminders.createReminders(
        reminderId, 
        updateData.start_date, 
        updateData.end_date, 
        weekDays
      );
      
      res.status(200).json({ message: "Reminder updated successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating reminder." });
    }
  },

  deleteRule: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const deleted = await Reminders.deleteReminderRule(userId, reminderId);
      if (!deleted)
        return res.status(404).json({ error: "Reminder not found or not deleted." });
      res.status(200).json({ message: "Reminder deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminder." });
    }
  },

  deleteMultipleRules: async (req, res) => {
    try {
      const { userId } = req.params;
      let { ids } = req.body;

      if (typeof ids === "string") {
        try {
          ids = JSON.parse(ids);
        } catch (err) {
          return res.status(400).json({ error: "Invalid format for IDs." });
        }
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Provide an array of reminder IDs to delete." });
      }

      const deletedCount = await Reminders.deleteMultipleReminderRules(userId, ids);
      res.status(200).json({ message: `Deleted ${deletedCount} reminder(s).` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminders." });
    }
  },

  getAllReminders: async (req, res) => {
    try {
      const userId = req.params.userId;
      const reminders = await Reminders.getAllReminders(userId);
      res.status(200).json(reminders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching reminders." });
    }
  },

  updateTakenStatus: async (req, res) => {
    try {
      const reminderId = req.params.reminderId;

      if (!('taken' in req.body)) {
        return res.status(400).json({ error: "Missing 'taken' field in request body." });
      }

      const updated = await Reminders.updateTakenStatus(reminderId, req.body.taken);
      if (updated > 0) {
        res.status(200).json({ message: "Reminder status updated successfully." });
      } else {
        res.status(404).json({ error: "Reminder not found." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating reminder status." });
    }
  },

  getRulesByMedicineId: async (req, res) => {
    try {
      const { medicineId } = req.params;
      const rules = await Reminders.getRulesByMedicineId(medicineId);
      res.status(200).json(rules);
    } catch (err) {
      console.error("Error in getRulesByMedicineId:", err);
      res.status(500).json({ error: "Error retrieving reminder rules." });
    }
  },

  getMedicineNameFromReminderId: async (req, res) => {
    try {
      const { reminderId } = req.params;
      const name = await Reminders.getMedicineNameByReminderId(reminderId);
      if (!name) {
        return res.status(404).json({ error: "Medicine not found for given reminder." });
      }
      res.status(200).json({ medicine_name: name });
    } catch (err) {
      console.error("Error in getMedicineNameFromReminderId:", err);
      res.status(500).json({ error: "Error retrieving medicine name." });
    }
  },
};
