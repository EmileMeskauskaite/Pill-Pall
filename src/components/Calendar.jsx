import { useState } from "react";
import ReminderButton from "./buttons/ReminderButton";

const Calendar = (props) => {
  const { dateRange, reminders, refetch } = props;

  if (!dateRange?.start || !reminders) {
    return <div>Loading calendar...</div>;
  }

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(new Date(dateRange.start));

  const groupedReminders = reminders.reduce((acc, reminder) => {
    const date = new Date(reminder.reminder_date);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(reminder);
    return acc;
  }, {});

  return (
    <div className="container px-2">
      <div className="row">
        {weekDates.map((date, index) => {
          const key = date.toISOString().split("T")[0];
          const remindersForDay = groupedReminders[key] || [];
          const isToday = date.getTime() === today.getTime();

          return (
            <div
              key={index}
              className="col-12 col-md border mb-3 mb-md-0"
              style={{ minHeight: "180px" }}
            >
              {/* Header */}
              <div className="fw-bold bg-light py-2 text-center border-bottom">
                <span className={isToday ? "text-primary" : ""}>
                  {daysOfWeek[index]} {formatDate(date)} {isToday && "(Today)"}
                </span>
              </div>

              {/* Reminders */}
              <div className="p-2">
                {remindersForDay.length > 0 ? (
                  remindersForDay.map((reminder) => (
                    <ReminderButton key={reminder.id} reminder={reminder} refetch={refetch}/>
                  ))
                ) : (
                  <div className="text-muted small text-center">No reminders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
