const db = require("../db");

module.exports = {
  getAllReminderRulesForUser: async (userId) => {
    const [reminderRules] = await db.query("SELECT * FROM reminder_rules WHERE user_id = ?", [userId]);
    
    for (let rule of reminderRules) {
      const [weekDays] = await db.query(
        "SELECT week_day FROM reminder_week_days WHERE reminder_rule_id = ?",
        [rule.id]
      );
      rule.week_days = weekDays.map(day => day.week_day);
    }
    
    return reminderRules;
  },

  getReminderRuleById: async (userId, reminderId) => {
    const [results] = await db.query("SELECT * FROM reminder_rules WHERE user_id = ? AND id = ?", [userId, reminderId]);
    
    if (results.length === 0) return null;
    
    const [weekDays] = await db.query(
      "SELECT week_day FROM reminder_week_days WHERE reminder_rule_id = ?",
      [reminderId]
    );
    
    const rule = results[0];
    rule.week_days = weekDays.map(day => day.week_day);
    
    return rule;
  },

  createReminderRule: async (reminderData) => {
    const {
      medicine_id, user_id, reminder_id, send_email_reminder, taken,
      reminder_minutes_before, start_date, end_date, reminder_time, week_day, week_days
    } = reminderData;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const [result] = await connection.query(
        `INSERT INTO reminder_rules
        (medicine_id, user_id, reminder_minutes_before, 
        start_date, end_date, reminder_time)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [medicine_id, user_id, reminder_minutes_before, 
          start_date, end_date, reminder_time]
      );
      
      const reminderRuleId = result.insertId;
      
      if (week_days && Array.isArray(week_days) && week_days.length > 0) {
        const weekDaysValues = week_days.map(day => [reminderRuleId, day]);
        await connection.query(
          "INSERT INTO reminder_week_days (reminder_rule_id, week_day) VALUES ?",
          [weekDaysValues]
        );
      } else if (week_day) {
        await connection.query(
          "INSERT INTO reminder_week_days (reminder_rule_id, week_day) VALUES (?, ?)",
          [reminderRuleId, week_day]
        );
      }
      
      await connection.commit();
      return reminderRuleId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  updateReminderRule: async (userId, reminderId, updateData) => {
    console.log(updateData)
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const { week_days, ...ruleData } = updateData;
      
      const [result] = await connection.query(
        `UPDATE reminder_rules SET ? WHERE id = ? AND user_id = ?`,
        [ruleData, reminderId, userId]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }
      
      if (week_days && Array.isArray(week_days)) {
        await connection.query(
          "DELETE FROM reminder_week_days WHERE reminder_rule_id = ?",
          [reminderId]
        );
        
        if (week_days.length > 0) {
          const weekDaysValues = week_days.map(day => [reminderId, day]);
          await connection.query(
            "INSERT INTO reminder_week_days (reminder_rule_id, week_day) VALUES ?",
            [weekDaysValues]
          );
        }
      }
      
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
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

  createReminders: async (reminder_rules_id, startDate, endDate, weekDays) => {
    try {
      const remindersToInsert = [];
      let current = new Date(startDate);
      const end = new Date(endDate);

      if (typeof weekDays === 'string' || typeof weekDays === 'number') {
        weekDays = [weekDays];
      }

      while (current <= end) {
        if (weekDays.includes(current.getDay().toString())) {
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
      reminder_time
    FROM reminder_rules
    WHERE medicine_id = ?`,
      [medicineId]
    );
    
    for (let rule of reminderRules) {
      const [weekDays] = await db.query(
        "SELECT week_day FROM reminder_week_days WHERE reminder_rule_id = ?",
        [rule.id]
      );
      rule.week_days = weekDays.map(day => day.week_day);
    }
    
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
