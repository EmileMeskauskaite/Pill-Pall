const CalendarTimeButtons = (props) => {
  const {dateRange, setDateRange} = props;

  function moveWeekBack(dateRange) {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
  
    newStart.setDate(newStart.getDate() - 7);
    newEnd.setDate(newEnd.getDate() - 7);
  
    return { start: newStart, end: newEnd };
  }

  function moveWeekForward(dateRange) {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
  
    newStart.setDate(newStart.getDate() + 7);
    newEnd.setDate(newEnd.getDate() + 7);
  
    return { start: newStart, end: newEnd };
  }
  
  return (
    <div className="container px-2 mb-3">
      <div className="d-flex justify-content-between gap-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDateRange(moveWeekBack(dateRange))}
        >
          ← Praeita savaitė
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setDateRange(moveWeekForward(dateRange))}
        >
          Kita savaitė →
        </button>
      </div>
    </div>
  );
  
};

export default CalendarTimeButtons;