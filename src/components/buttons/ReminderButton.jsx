import React, { useState } from "react";
import ReminderModal from "../forms/ReminderModal";

const ReminderButton = (props) => {
  const { reminder, refetch } = props;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminderDate = new Date(reminder.reminder_date);
  reminderDate.setHours(0, 0, 0, 0);
  const isPastAndUntaken = reminderDate < today && !reminder.taken;
  const isTaken = reminder.taken;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Decide button class
  let buttonClass = "btn btn-sm d-block text-start w-100 mb-2 ";
  if (isTaken) {
    buttonClass += "btn-success text-white";
  } else if (isPastAndUntaken) {
    buttonClass += "btn-danger text-white";
  } else {
    buttonClass += "btn-outline-secondary";
  }

  return (
    <div>
      <button className={buttonClass} onClick={openModal}>
        <div className="fw-semibold">{reminder.medicine_name}</div>
        <div className="small text-muted text-center">
          {reminder.reminder_time?.slice(0, 5)}
        </div>
      </button>

      {isModalOpen && (
        <ReminderModal reminder={reminder} onClose={closeModal} refetch={refetch}/>
      )}
    </div>
  );
};

export default ReminderButton;
