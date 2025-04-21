import React, { useState, useEffect } from "react";
import ReminderModal from "../forms/ReminderModal";

const ReminderButton = (props) => {
  const { reminder, refetch } = props;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const userData = JSON.parse(localStorage.getItem("user"));
  const reminderDate = new Date(reminder.reminder_date);
  reminderDate.setHours(0, 0, 0, 0);
  const isPastAndUntaken = reminderDate < today && !reminder.taken;
  const isTaken = reminder.taken;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineName, setMedicineName] = useState();
  
  useEffect(()=>{
    getMedicineName()
  },[])

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const getMedicineName = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await fetch(
        `http://localhost:5169/${userData.id}/reminder/${reminder.id}/medicine-name`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicineName(data.medicine_name);
        return data;
      } else {
        console.error("Failed to fetch reminder ID");
      }
    } catch (error) {
      console.error("Error fetching reminder ID:", error);
    }
  }

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
          <h4>{medicineName}</h4>
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
