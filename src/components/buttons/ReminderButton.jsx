import React, { useState, useEffect } from "react";
import ReminderModal from "../forms/ReminderModal";

const ReminderButton = ({ reminder, refetch }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminderDate = new Date(reminder.reminder_date);
  reminderDate.setHours(0, 0, 0, 0);

  const isPastAndUntaken = reminderDate < today && !reminder.taken;
  const isTaken = reminder.taken;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineName, setMedicineName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await fetch(
          `http://localhost:5169/${user.id}/reminder/${reminder.id}/medicine-name`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (res.ok) {
          const { medicine_name } = await res.json();
          setMedicineName(medicine_name);
        }
      } catch (err) {
        console.error("Nepavyko gauti vaisto pavadinimo:", err);
      }
    })();
  }, [reminder.id]);

  const toggleModal = () => setIsModalOpen((o) => !o);

  const time = reminder.reminder_time?.slice(0, 5) || "";

  let buttonClass = "btn btn-sm d-block text-start w-100 mb-2 ";
  if (isTaken) {
    buttonClass += "btn-success text-white";
  } else if (isPastAndUntaken) {
    buttonClass += "btn-danger text-white";
  } else {
    buttonClass += "btn-outline-secondary";
  }

  return (
    <>
      <button className={buttonClass} onClick={toggleModal}>
        <div className="fw-semibold">
          {medicineName || reminder.medicine_name}
        </div>
        <div className="small text-center text-muted">{time}</div>
      </button>

      {isModalOpen && (
        <ReminderModal
          reminder={reminder}
          onClose={() => setIsModalOpen(false)}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default ReminderButton;
