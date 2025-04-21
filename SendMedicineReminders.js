// services/ReminderEmailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const db = require('./db');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMedicineReminders() {
  const now = new Date();

  // 1) grab all today’s unapplied reminders, formatting the date in SQL
  const [rows] = await db.query(
    `SELECT
       r.id                        AS reminderId,
       DATE_FORMAT(r.reminder_date, '%Y-%m-%d') AS reminderDate,
       rr.reminder_time            AS reminderTime,
       rr.reminder_minutes_before  AS minutesBefore,
       u.id                        AS userId,
       u.email                     AS userEmail,
       u.name                      AS firstName,
       u.surname                   AS lastName,
       m.medicine_name             AS medicineName
     FROM reminders AS r
     JOIN reminder_rules AS rr
       ON r.reminder_rules_id = rr.id
     JOIN users AS u
       ON rr.user_id = u.id
     JOIN medicines AS m
       ON rr.medicine_id = m.id
     WHERE r.sent_email = 0
       AND r.reminder_date = CURDATE()`
  );

  for (const rem of rows) {
    // rem.reminderDate is now a 'YYYY-MM-DD' string
    const scheduledTs = new Date(`${rem.reminderDate}T${rem.reminderTime}`).getTime();
    const sendTs = scheduledTs - rem.minutesBefore * 60_000;

    if (now.getTime() >= sendTs) {
      const mailOptions = {
        from:    `"PillPal" <${process.env.EMAIL_USER}>`,
        to:      rem.userEmail,
        subject: '📬 Medication Reminder',
        html: `
          <p>Hi ${rem.firstName},</p>
          <p>This is a reminder to take your medicine
             <strong>${rem.medicineName}</strong>
             on <strong>${rem.reminderDate}</strong>
             at <strong>${rem.reminderTime}</strong>.</p>
          <p>(Sent ${rem.minutesBefore} minutes before your scheduled time.)</p>
        `,
      };

      try {
        console.log(`→ Sending reminder #${rem.reminderId} to ${rem.userEmail}`);
        await transporter.sendMail(mailOptions);
        await db.query(
          `UPDATE reminders
           SET sent_email = 1
           WHERE id = ?`,
          [rem.reminderId]
        );
        console.log(`✔ Reminder #${rem.reminderId} marked sent`);
      } catch (emailErr) {
        console.error(`✖ Failed to send reminder #${rem.reminderId}:`, emailErr);
      }
    }
  }
}

module.exports = {
  transporter,
  sendMedicineReminders,
};
