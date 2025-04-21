const db = require("../db");

module.exports = {
  getAllReminderRulesForUser: async (userId) => {
    const [reminderRules] = await db.query("SELECT * FROM reminder_rules WHERE user_id = ?", [userId]);
    return reminderRules;
  },

  getReminderRuleById: async (userId, reminderId) => {
    const [results] = await db.query("SELECT * FROM reminder_rules WHERE user_id = ? AND id = ?", [userId, reminderId]);
    return results.length > 0 ? results[0] : null;
  },

  createReminderRule: async (reminderData) => {
    const {
      medicine_id, user_id, reminder_id, send_email_reminder, taken,
      reminder_minutes_before, start_date, end_date, reminder_time, week_day
    } = reminderData;

    const [result] = await db.query(
      `INSERT INTO reminder_rules
      (medicine_id, user_id, reminder_minutes_before, 
      start_date, end_date, reminder_time, week_day)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [medicine_id, user_id,reminder_minutes_before, 
        start_date, end_date, reminder_time, week_day]
    );

    return result.insertId;
  },

  updateReminderRule: async (userId, reminderId, updateData) => {
    console.log(updateData)
    const [result] = await db.query(
      `UPDATE reminder_rules SET ? WHERE id = ? AND user_id = ?`,
      [updateData, reminderId, userId]
    );
    return result.affectedRows > 0;
  },

  deleteReminderRule: async (userId, reminderId) => {
    const [result] = await db.query(
      "DELETE FROM reminder_rules WHERE id = ? AND user_id = ?",
      [reminderId, userId]
    );
    return result.affectedRows > 0;
  },

  deleteMultipleReminderRules: async (userId, reminderIds) => {
    if (!reminderIds || reminderIds.length === 0) return 0;
    const placeholders = reminderIds.map(() => '?').join(',');
    const [result] = await db.query(
      `DELETE FROM reminder_rules WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...reminderIds]
    );
    return result.affectedRows;
  },

  // Actual reminders
  getAllReminders: async (userId) => {
    try {
      const [reminders] = await db.query(
        `SELECT reminders.*, reminder_rules.medicine_id, reminder_time
         FROM reminders
         JOIN reminder_rules ON reminders.reminder_rules_id = reminder_rules.id
         WHERE reminder_rules.user_id = ?`,
        [userId]
      );
      return reminders;
    } catch (err) {
      console.error("Error fetching reminders:", err);
      throw err;
    }
  },

  updateTakenStatus: async (reminderId, taken) => {
    try {
      const [result] = await db.query(
        "UPDATE reminders SET taken = ? WHERE id = ?",
        [taken, reminderId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error updating reminder taken status:", err);
      throw err;
    }
  },

  updateSentEmailStatus: async (reminderId, sent) => {
    try {
      const [result] = await db.query(
        "UPDATE reminders SET sent_email = ? WHERE id = ?",
        [sent, reminderId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error updating sent_email status:", err);
      throw err;
    }
  },

  
  createReminders: async (reminder_rules_id, startDate, endDate, weekDay) => {
    try {
      const remindersToInsert = [];
      let current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        if (current.getDay() == weekDay) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, "0");
          const day = String(current.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;
          remindersToInsert.push([formattedDate, reminder_rules_id]);
        }
        current.setDate(current.getDate() + 1);
      }

      if (remindersToInsert.length === 0) {
        return 0;
      }

      const [result] = await db.query(
        "INSERT INTO reminders (reminder_date, reminder_rules_id) VALUES ?",
        [remindersToInsert]
      );

      return result.affectedRows;
    } catch (err) {
      console.error("Error creating reminders:", err);
      throw new Error("Could not create reminders.");
    }
  },
  

  getRulesByMedicineId: async (medicineId) => {
    const [reminderRules] = await db.query(
      `SELECT 
      id, medicine_id, user_id, reminder_minutes_before,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
      reminder_time, week_day
    FROM reminder_rules
    WHERE medicine_id = ?`,
      [medicineId]
    );
    return reminderRules;
  },

deleteRemindersByRuleId: async (reminderRuleId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM reminders WHERE reminder_rules_id = ?",
      [reminderRuleId]
    );
    return result.affectedRows;
  } catch (err) {
    console.error("Error deleting reminders by rule ID:", err);
    throw new Error("Could not delete reminders for the given rule.");
  }
},

getMedicineNameByReminderId: async (reminderId) => {
  try {
    const [result] = await db.query(
      `SELECT m.medicine_name
       FROM reminders r
       JOIN reminder_rules rr ON r.reminder_rules_id = rr.id
       JOIN medicines m ON rr.medicine_id = m.id
       WHERE r.id = ?`,
      [reminderId]
    );
    return result.length > 0 ? result[0].medicine_name : null;
  } catch (err) {
    console.error("Error fetching medicine name:", err);
    throw new Error("Could not fetch medicine name.");
  }
},


};
