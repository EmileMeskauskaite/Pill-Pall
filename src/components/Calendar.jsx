import { useState } from "react";

const Calendar = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [schedule, setSchedule] = useState([]);

  const fetchSchedule = async (token) => {
    try {
      const response = await fetch("http://localhost:5169/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      } else {
        console.error("Failed to fetch schedule");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const renderWeeklyCalendar = () => {
    const handleMarkAsTaken = async (medicineId) => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `http://localhost:5169/medicines/${medicineId}/taken`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          fetchSchedule(token);
        } else {
          console.error("Failed to update taken status");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    return (
      <div className="container px-2">
        {/* Weekday headers */}
        <div className="row text-center fw-bold mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="col border bg-light py-2">
              {day === today ? (
                <span className="text-primary">{day} (Today)</span>
              ) : (
                <span>{day}</span>
              )}
            </div>
          ))}
        </div>

        {/* Medicine per day */}
        <div className="row text-center">
          {daysOfWeek.map((day) => {
            const medsForDay = schedule.filter((med) =>
              med.days_of_week.includes(day)
            );
            const isToday = today === day;

            return (
              <div
                key={day}
                className="col border"
                style={{ minHeight: "200px" }}
              >
                {medsForDay.length > 0 ? (
                  medsForDay.map((med) =>
                    med.times_per_day.map((time, i) => (
                      <div
                        key={`${med.id}-${time}-${i}`}
                        className={`mb-2 p-2 rounded small ${
                          isToday ? "bg-warning-subtle" : "bg-body-tertiary"
                        }`}
                      >
                        <div>
                          <strong>{med.medicine_name}</strong> – {med.strength}
                        </div>
                        <div>
                          {time} – {med.amount} tablet(s)
                        </div>
                        {med.notes && (
                          <div className="fst-italic small">{med.notes}</div>
                        )}
                        <div
                          className={med.taken ? "text-success" : "text-danger"}
                        >
                          {med.taken ? "Taken" : "Not taken"}
                        </div>
                        {isToday && !med.taken && (
                          <button
                            className="btn btn-sm btn-outline-success mt-1"
                            onClick={() => handleMarkAsTaken(med.id)}
                          >
                            Mark as Taken
                          </button>
                        )}
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-muted mt-3">No meds</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return <>{renderWeeklyCalendar()}</>;
};

export default Calendar;
