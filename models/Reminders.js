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
};
