import React from "react";

const CalendarTimeButtons = ({ dateRange, setDateRange }) => {
  const moveWeekBack = (range) => {
    const newStart = new Date(range.start);
    const newEnd = new Date(range.end);
    newStart.setDate(newStart.getDate() - 7);
    newEnd.setDate(newEnd.getDate() - 7);
    return { start: newStart, end: newEnd };
  };

  const moveWeekForward = (range) => {
    const newStart = new Date(range.start);
    const newEnd = new Date(range.end);
    newStart.setDate(newStart.getDate() + 7);
    newEnd.setDate(newEnd.getDate() + 7);
    return { start: newStart, end: newEnd };
  };

  return (
    <div className="container px-2 mb-3">
      <div className="d-flex justify-content-between gap-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDateRange(moveWeekBack(dateRange))}
        >
          ← Ankstesnė savaitė
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setDateRange(moveWeekForward(dateRange))}
        >
          Sekanti savaitė →
        </button>
      </div>
    </div>
  );
};

export default CalendarTimeButtons;
