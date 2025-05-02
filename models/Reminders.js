const db = require("../db");

module.exports = {
  getAllReminderRulesForUser: async (userId) => {
    const [reminderRules] = await db.query(
      "SELECT * FROM reminder_rules WHERE user_id = ?",
      [userId]
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

  getReminderRuleById: async (userId, reminderId) => {
    const [results] = await db.query(
      "SELECT * FROM reminder_rules WHERE user_id = ? AND id = ?",
      [userId, reminderId]
    );
    
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
      medicine_id,
      user_id,
      reminder_minutes_before,
      start_date,
      end_date,
      reminder_time,
      week_days
    } = reminderData;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert reminder rule
      const [result] = await connection.query(
        `INSERT INTO reminder_rules
        (medicine_id, user_id, reminder_minutes_before, 
        start_date, end_date, reminder_time)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [medicine_id, user_id, reminder_minutes_before, 
          start_date, end_date, reminder_time]
      );
      
      const reminderRuleId = result.insertId;
      
      // Insert week days
      if (week_days && Array.isArray(week_days) && week_days.length > 0) {
        const weekDaysValues = week_days.map(day => [reminderRuleId, day]);
        await connection.query(
          "INSERT INTO reminder_week_days (reminder_rule_id, week_day) VALUES ?",
          [weekDaysValues]
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
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const { week_days, ...ruleData } = updateData;
      
      // Update reminder rule
      const [result] = await connection.query(
        `UPDATE reminder_rules SET ? WHERE id = ? AND user_id = ?`,
        [ruleData, reminderId, userId]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }
      
      // Update week days
      if (week_days && Array.isArray(week_days)) {
        // Delete existing week days
        await connection.query(
          "DELETE FROM reminder_week_days WHERE reminder_rule_id = ?",
          [reminderId]
        );
        
        // Insert new week days
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
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete the reminder rule (cascade will handle related records)
      const [result] = await connection.query(
        "DELETE FROM reminder_rules WHERE id = ? AND user_id = ?",
        [reminderId, userId]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  deleteMultipleReminderRules: async (userId, reminderIds) => {
    if (!reminderIds || reminderIds.length === 0) return 0;
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const placeholders = reminderIds.map(() => '?').join(',');
      const [result] = await connection.query(
        `DELETE FROM reminder_rules WHERE user_id = ? AND id IN (${placeholders})`,
        [userId, ...reminderIds]
      );
      
      await connection.commit();
      return result.affectedRows;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  getAllReminders: async (userId) => {
    try {
      const [reminders] = await db.query(
        `SELECT 
          r.*,
          rr.medicine_id,
          rr.reminder_time,
          rr.reminder_minutes_before,
          m.medicine_name
         FROM reminders r
         JOIN reminder_rules rr ON r.reminder_rules_id = rr.id
         JOIN medicines m ON rr.medicine_id = m.id
         WHERE rr.user_id = ?
         ORDER BY r.reminder_date, rr.reminder_time`,
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
      return result.affectedRows;
    } catch (err) {
      console.error("Error updating reminder taken status:", err);
      throw err;
    }
  },

  createReminders: async (reminder_rules_id, startDate, endDate, weekDays) => {
    try {
      const remindersToInsert = [];
      
      // Handle both string dates and Date objects
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      let current = new Date(start);

      // Ensure input dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
      }

      // Ensure weekDays is an array of strings
      const weekDaysArray = Array.isArray(weekDays) ? weekDays : [weekDays];

      while (current <= end) {
        const currentDay = current.getDay().toString();
        if (weekDaysArray.includes(currentDay)) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, "0");
          const day = String(current.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;
          remindersToInsert.push([formattedDate, reminder_rules_id]);
        }
        
        // Create a new Date object for the next day to avoid reference issues
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        current = nextDay;
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
        rr.id,
        rr.medicine_id,
        rr.user_id,
        rr.reminder_minutes_before,
        DATE_FORMAT(rr.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(rr.end_date, '%Y-%m-%d') AS end_date,
        rr.reminder_time,
        GROUP_CONCAT(rwd.week_day) AS week_days
      FROM reminder_rules rr
      LEFT JOIN reminder_week_days rwd ON rr.id = rwd.reminder_rule_id
      WHERE rr.medicine_id = ?
      GROUP BY rr.id`,
      [medicineId]
    );
    
    // Convert week_days string to array
    for (let rule of reminderRules) {
      rule.week_days = rule.week_days ? rule.week_days.split(',') : [];
    }
    
    return reminderRules;
  },

  getMedicineNameByReminderId: async (reminderId) => {
    try {
      const [results] = await db.query(
        `SELECT m.medicine_name
         FROM medicines m
         JOIN reminder_rules rr ON m.id = rr.medicine_id
         JOIN reminders r ON rr.id = r.reminder_rules_id
         WHERE r.id = ?`,
        [reminderId]
      );
      return results.length > 0 ? results[0].medicine_name : null;
    } catch (err) {
      console.error("Error getting medicine name:", err);
      throw err;
    }
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
      throw err;
    }
  },
};
