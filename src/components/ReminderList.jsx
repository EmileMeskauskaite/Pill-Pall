import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ReminderDeleteButton from "./buttons/ReminderDeleteButton";

const weekDaysMap = {
  0: "Sekmadienis",
  1: "Pirmadienis",
  2: "Antradienis",
  3: "Trečiadienis",
  4: "Ketvirtadienis",
  5: "Penktadienis",
  6: "Šeštadienis",
};

const ReminderList = ({ reminders, refetch, onSuccessChange, onEdit, onReminder }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  const formatWeekdays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "";
    return days.map((d) => weekDaysMap[d]).filter(Boolean).join(", ");
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="d-md-none">
        <div className="row row-cols-1 g-4 mt-3">
          {reminders.map((reminder, index) => (
            <div key={reminder.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Priminimas #{index + 1}</h5>
                  <div className="card-text">
                    <p><strong>Minutės prieš:</strong> {reminder.reminder_minutes_before}</p>
                    <p><strong>Pradžios data:</strong> {formatDate(reminder.start_date)}</p>
                    <p><strong>Pabaigos data:</strong> {formatDate(reminder.end_date)}</p>
                    <p><strong>Laikas:</strong> {formatTime(reminder.reminder_time)}</p>
                    <p><strong>Savaitės dienos:</strong> {formatWeekdays(reminder.week_days)}</p>
                  </div>
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-warning flex-grow-1 me-1"
                      onClick={() => onEdit(reminder)}
                      title="Redaguoti"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <ReminderDeleteButton
                      reminderId={reminder.id}
                      refetch={refetch}
                      handleSuccess={onSuccessChange}
                      className="btn btn-danger flex-grow-1 ms-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-md-block m-3">
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover table-sm text-center align-middle w-100">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Minutės prieš</th>
                <th>Pradžios data</th>
                <th>Pabaigos data</th>
                <th>Laikas</th>
                <th>Savaitės dienos</th>
                <th>Redaguoti</th>
                <th>Trinti</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder, idx) => (
                <tr key={reminder.id}>
                  <td>{idx + 1}</td>
                  <td>{reminder.reminder_minutes_before}</td>
                  <td>{formatDate(reminder.start_date)}</td>
                  <td>{formatDate(reminder.end_date)}</td>
                  <td>{formatTime(reminder.reminder_time)}</td>
                  <td>{formatWeekdays(reminder.week_days)}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => onEdit(reminder)}
                      title="Redaguoti"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                  </td>
                  <td>
                    <ReminderDeleteButton
                      reminderId={reminder.id}
                      refetch={refetch}
                      handleSuccess={onSuccessChange}
                      className="btn btn-danger btn-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReminderList;
