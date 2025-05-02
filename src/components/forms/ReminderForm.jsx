import { useEffect, useState } from "react";

const ReminderForm = (props) => {
  const { setFormData, formData, handleSubmit } = props;
  const [selectedDays, setSelectedDays] = useState([]);

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
    week_days: [],
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
      setFormData(formatted);
      setSelectedDays(formatted.week_days || []);
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
    </form>
  );
};

export default ReminderForm;
