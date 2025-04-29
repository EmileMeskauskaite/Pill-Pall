import { useEffect, useState } from "react";

const ReminderForm = (props) => {
  const { setFormData, formData, handleSubmit } = props;
  const [selectedDays, setSelectedDays] = useState([]);

  function getFormattedCurrentDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const defaultFormData = {
    reminder_minutes_before: "0",
    start_date: getFormattedCurrentDate(),
    end_date: getFormattedCurrentDate(),
    reminder_time: "12:00",
    week_days: [],
  };

  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) {
      setFormData(defaultFormData);
    } else {
      const formatted = {
        ...formData,
        reminder_time: formData.reminder_time?.slice(0, 5) || "",
      };
      setFormData(formatted);
      
      // If editing, set the selected days
      if (formData.week_days && Array.isArray(formData.week_days)) {
        setSelectedDays(formData.week_days);
      } else if (formData.week_day) {
        // For backward compatibility
        setSelectedDays([formData.week_day]);
      }
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

  const handleDayChange = (dayValue) => {
    let updatedDays;
    if (selectedDays.includes(dayValue)) {
      // Remove the day if it's already selected
      updatedDays = selectedDays.filter(day => day !== dayValue);
    } else {
      // Add the day if it's not selected
      updatedDays = [...selectedDays, dayValue];
    }
    setSelectedDays(updatedDays);
    
    // Update the form data with the week_days array
    setFormData(prevData => ({
      ...prevData,
      week_days: updatedDays
    }));
  };

  const handleSelectAllDays = () => {
    const allDays = ["0", "1", "2", "3", "4", "5", "6"];
    setSelectedDays(allDays);
    
    // Update the form data with all days
    setFormData(prevData => ({
      ...prevData,
      week_days: allDays
    }));
  };

  const handleDeselectAllDays = () => {
    setSelectedDays([]);
    
    // Update the form data with empty days array
    setFormData(prevData => ({
      ...prevData,
      week_days: []
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Pass the form data with week_days array to the parent component
    handleSubmit(formData);
  };

  const isEditing = formData && formData.id;

  return (
    <form onSubmit={handleFormSubmit} className="p-3">
      <h4 className="text-center mb-4">
        {isEditing ? "Pakeisti egzistuojantį priminimą" : "Pridėti naują priminimą"}
      </h4>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Minutės prieš priminimą
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
        <label className="form-label fw-semibold">Pradžios data</label>
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
        <label className="form-label fw-semibold">Pabaigos data</label>
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
        <label className="form-label fw-semibold">Priminimo laikas</label>
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
        <label className="form-label fw-semibold">Savaitės dienos</label>
        <div className="d-flex justify-content-between mb-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-primary"
            onClick={handleSelectAllDays}
          >
            Pasirinkti visas
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary"
            onClick={handleDeselectAllDays}
          >
            Nuimti visas
          </button>
        </div>
        <div className="d-flex flex-wrap gap-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-1"
              checked={selectedDays.includes("1")}
              onChange={() => handleDayChange("1")}
            />
            <label className="form-check-label" htmlFor="day-1">Pirmadienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-2"
              checked={selectedDays.includes("2")}
              onChange={() => handleDayChange("2")}
            />
            <label className="form-check-label" htmlFor="day-2">Antradienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-3"
              checked={selectedDays.includes("3")}
              onChange={() => handleDayChange("3")}
            />
            <label className="form-check-label" htmlFor="day-3">Trečiadienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-4"
              checked={selectedDays.includes("4")}
              onChange={() => handleDayChange("4")}
            />
            <label className="form-check-label" htmlFor="day-4">Ketvirtadienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-5"
              checked={selectedDays.includes("5")}
              onChange={() => handleDayChange("5")}
            />
            <label className="form-check-label" htmlFor="day-5">Penktadienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-6"
              checked={selectedDays.includes("6")}
              onChange={() => handleDayChange("6")}
            />
            <label className="form-check-label" htmlFor="day-6">Šeštadienis</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="day-0"
              checked={selectedDays.includes("0")}
              onChange={() => handleDayChange("0")}
            />
            <label className="form-check-label" htmlFor="day-0">Sekmadienis</label>
          </div>
        </div>
        {selectedDays.length === 0 && (
          <div className="text-danger mt-1">Bent viena diena turi būti pasirinkta</div>
        )}
      </div>

      <button 
        type="submit" 
        className="btn btn-success w-100"
        disabled={selectedDays.length === 0}
      >
        {isEditing ? "Atnaujinti" : "Išsaugoti"}
      </button>
    </form>
  );
};

export default ReminderForm;
