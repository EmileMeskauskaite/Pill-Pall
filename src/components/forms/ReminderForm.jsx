import { useEffect } from "react";

const ReminderForm = (props) => {
  const { setFormData, formData, handleSubmit } = props;

  function getFormattedCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const defaultFormData = {
    reminder_minutes_before: "0",
    start_date: getFormattedCurrentDate(),
    end_date: getFormattedCurrentDate(),
    reminder_time: "12:00",
    week_day: "",
  };

  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) {
      setFormData(defaultFormData);
    } else {
      const formatted = {
        ...formData,
        reminder_time: formData.reminder_time?.slice(0, 5) || "",
        week_days: formData.week_days || [formData.week_day].filter(Boolean),
      };
<<<<<<< HEAD
<<<<<<< HEAD
      setFormData(formatted);
      setSelectedDays(formatted.week_days || []);
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { value, name } = e.target;
    if (/^\d*$/.test(value)) {
      const numericValue = parseInt(value);
      if (name === "reminder_minutes_before") {
        if (value === "" || (numericValue >= 0 && numericValue <= 60)) {
          handleChange(e);
        } else {
          e.target.value = "";
        }
      } else {
        handleChange(e);
      }
    } else {
      e.target.value = "";
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
  const handleDayChange = (dayValue) => {
    let updatedDays;
    if (selectedDays.includes(dayValue)) {
      updatedDays = selectedDays.filter(day => day !== dayValue);
    } else {
      updatedDays = [...selectedDays, dayValue];
    }
    setSelectedDays(updatedDays);
    
    setFormData(prevData => ({
      ...prevData,
      week_days: updatedDays
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (selectedDays.length === 0) {
      alert("Prašome pasirinkti bent vieną savaitės dieną");
      return;
    }

    // Pass the form data with selected days to the parent component
    handleSubmit({
      ...formData,
      week_days: selectedDays
    });
  };

  const isEditing = formData && formData.id;
  const weekDays = [
    { id: "0", name: "Sekmadienis" },
    { id: "1", name: "Pirmadienis" },
    { id: "2", name: "Antradienis" },
    { id: "3", name: "Trečiadienis" },
    { id: "4", name: "Ketvirtadienis" },
    { id: "5", name: "Penktadienis" },
    { id: "6", name: "Šeštadienis" }
  ];

=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
  return (
    <form onSubmit={handleSubmit} className="p-3">
      <h4 className="text-center mb-4">Add New Reminder</h4>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Reminder Minutes Before
        </label>
        <input
          type="number"
          name="reminder_minutes_before"
          className="form-control"
          value={formData.reminder_minutes_before || 0}
          onChange={handleNumberChange}
          required
          min="0"
          max="60"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Start Date</label>
        <input
          type="date"
          name="start_date"
          className="form-control"
          value={formData.start_date || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">End Date</label>
        <input
          type="date"
          name="end_date"
          className="form-control"
          value={formData.end_date || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Reminder Time</label>
        <input
          type="time"
          name="reminder_time"
          className="form-control"
          value={formData.reminder_time || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
<<<<<<< HEAD
<<<<<<< HEAD
        <label className="form-label fw-semibold">Savaitės dienos</label>
        <div className="d-flex flex-wrap gap-3">
          {weekDays.map(day => (
            <div key={day.id} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`day-${day.id}`}
                checked={selectedDays.includes(day.id)}
                onChange={() => handleDayChange(day.id)}
              />
              <label className="form-check-label" htmlFor={`day-${day.id}`}>
                {day.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">
          {isEditing ? "Išsaugoti pakeitimus" : "Pridėti priminimą"}
        </button>
      </div>
=======
        <label className="form-label fw-semibold">Week Day</label>
        <select
          name="week_day"
          className="form-control"
          value={formData.week_day || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select a day</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
          <option value="0">Sunday</option>
        </select>
      </div>

=======
        <label className="form-label fw-semibold">Week Day</label>
        <select
          name="week_day"
          className="form-control"
          value={formData.week_day || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select a day</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
          <option value="0">Sunday</option>
        </select>
      </div>

>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
      <button type="submit" className="btn btn-success w-100">
        Submit
      </button>
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
    </form>
  );
};

export default ReminderForm;
