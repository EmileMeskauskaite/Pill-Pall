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
    const scheduledTs = new Date(`${rem.reminderDate}T${rem.reminderTime}`).getTime();
    const sendTs = scheduledTs - rem.minutesBefore * 60_000;

    if (now.getTime() >= sendTs) {
      const mailOptions = {
        from:    `"PillPal" <${process.env.EMAIL_USER}>`,
        to:      rem.userEmail,
        subject: '📬 Vaistų priminimas',
        html: `
          <p>Sveiki, ${rem.firstName},</p>
          <p>Primename, kad reikia išgerti vaistus
             <strong>${rem.medicineName}</strong>
             <strong>${rem.reminderDate}</strong> dieną
             <strong>${rem.reminderTime}</strong> valandą.</p>
          <p>(Šis priminimas išsiųstas ${rem.minutesBefore} min. prieš suplanuotą laiką.)</p>
        `,
      };

      try {
        console.log(`→ Siunčiamas priminimas #${rem.reminderId} vartotojui ${rem.userEmail}`);
        await transporter.sendMail(mailOptions);
        await db.query(
          `UPDATE reminders
           SET sent_email = 1
           WHERE id = ?`,
          [rem.reminderId]
        );
        console.log(`✔ Priminimas #${rem.reminderId} pažymėtas kaip išsiųstas`);
      } catch (emailErr) {
        console.error(`✖ Nepavyko išsiųsti priminimo #${rem.reminderId}:`, emailErr);
      }
    }
  }
}

module.exports = {
  transporter,
  sendMedicineReminders,
};
