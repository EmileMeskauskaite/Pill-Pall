import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Calendar from "../components/Calendar";
import CalendarTimeButtons from "../components/buttons/CalendarTimeButtons";
import SuccessNotification from "../components/notifications/SuccessNotification";

const SchedulePage = () => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user"));
  const [userName, setUserName] = useState();
  const [reminders, setReminders] = useState();
  const [dateRange, setDateRange] = useState();
  const [successShow, setSuccessShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    } else {
      setUserName(userData.name);
      refetchReminders(false);
      setDateRange(getThisWeek);
    }
  }, []);

  const handleSuccessNotification = () => {
    setSuccessShow(true);
    setTimeout(() => setSuccessShow(false), 3100);
  };

  const getThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust if today is Sunday

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  };

  const refetchReminders = async (showNotification = true) => {
    const parsed = await fetchReminders();
    if (showNotification) {
      handleSuccessNotification();
    }
    setReminders(parsed);
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch(
        `http://localhost:5169/${userData.id}/reminders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const parsed = await response.json();
        return parsed;
      } else {
        console.error("Failed to fetch reminders");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
      <Header />
      {successShow && <SuccessNotification />}
      <h1 className="text-center">Welcome, {userName}</h1>
      <div className="container py-4">
        <h2 className="text-center mb-4"></h2>
        <h3 className="text-center mb-4">Weekly Pill Calendar</h3>
        <CalendarTimeButtons
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <Calendar
          reminders={reminders}
          dateRange={dateRange}
          refetch={refetchReminders}
        />
      </div>
    </>
  );
};

export default SchedulePage;
