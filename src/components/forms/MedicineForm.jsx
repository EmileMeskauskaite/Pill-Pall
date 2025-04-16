const MedicineForm = () => {
  const [pillAmount, setPillAmount] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const userData = localStorage.get("user");

  const [newMedicine, setNewMedicine] = useState({
    medicine_name: "",
    strength: "",
    amount: 1,
    times_per_day: ["08:00"],
    start_date: "",
    end_date: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    reminder_minutes_before: 30,
    send_email_reminder: true,
    repeat_type: "weekly",
    days_of_week: [],
    interval_days: null,
    cycle_on_days: null,
    cycle_off_days: null,
    notes: "",
    taken: false,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5169/medicines/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMedicine),
      });

      if (response.ok) {
        setNewMedicine({
          medicine_name: "",
          strength: "",
          amount: 1,
          times_per_day: "",
          start_date: "",
          end_date: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          reminder_minutes_before: 30,
          send_email_reminder: true,
          repeat_type: "weekly",
          days_of_week: [],
          interval_days: null,
          cycle_on_days: null,
          cycle_off_days: null,
          notes: "",
          taken: false,
        });
        setShowForm(false);
        fetchSchedule(token);
      } else {
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleNumberChange = (e) => {
    const { value, name } = e.target;

    if (/^\d*$/.test(value)) {
      if (name === "hour") {
        // For hours
        if (value === "" || parseInt(value) <= 23) {
          setHours(value);
        } else {
          e.target.value = "";
        }
      } else if (name === "minute") {
        // For minutes
        if (value === "" || parseInt(value) <= 59) {
          setMinutes(value);
        } else {
          e.target.value = "";
        }
        // For amount
      } else if (name === "amount") {
        if (value === "" || typeof parseInt(value) === "number") {
          setPillAmount(value);
        } else {
          e.target.value = "";
        }
      }
    } else {
      e.target.value = "";
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "days_of_week") {
      setNewMedicine((prev) => ({
        ...prev,
        days_of_week: checked
          ? [...prev.days_of_week, value]
          : prev.days_of_week.filter((d) => d !== value),
      }));
    } else {
      setNewMedicine((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="mt-5 border p-3 rounded bg-light"
    >
      <h4 className="mb-3">Add New Medicine</h4>

      <div className="mb-2">
        <label>Medicine Name</label>
        <input
          type="text"
          name="medicine_name"
          className="form-control"
          value={newMedicine.medicine_name}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-2">
        <label>Strength (e.g. 200mg)</label>
        <input
          type="text"
          name="strength"
          className="form-control"
          value={newMedicine.strength}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-2">
        <label>Amount (tablets per dose)</label>
        <input
          type="int"
          name="amount"
          placeholder="e.g.: 5"
          className="form-control"
          pattern="^(?:1[0-9]|2[0-3]|[0-9])$"
          onChange={handleNumberChange}
        />
      </div>
      <div className="mb-2">
        <label>Time</label>
        <div>
          Hour
          <input
            type="int"
            name="hour"
            placeholder="e.g.: 23"
            className="form-control"
            pattern="^(?:1[0-9]|2[0-3]|[0-9])$"
            maxLength="2"
            onChange={handleNumberChange}
          />
        </div>
        <div>
          Minutes
          <input
            type="int"
            name="minute"
            placeholder="e.g.: 59"
            className="form-control"
            pattern="^(?:1[0-9]|2[0-3]|[0-9])$"
            maxLength="2"
            onChange={handleNumberChange}
          />
        </div>
      </div>
      <div className="mb-2">
        <label>Start Date</label>
        <input
          type="date"
          name="start_date"
          className="form-control"
          value={newMedicine.start_date}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-2">
        <label>End Date</label>
        <input
          type="date"
          name="end_date"
          className="form-control"
          value={newMedicine.end_date}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-2">
        <label>Days of the Week</label>
        <div className="d-flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <div key={day}>
              <input
                type="checkbox"
                name="days_of_week"
                value={day}
                onChange={handleFormChange}
                checked={newMedicine.days_of_week.includes(day)}
              />{" "}
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label>Notes</label>
        <input
          type="text"
          name="notes"
          className="form-control"
          value={newMedicine.notes}
          onChange={handleFormChange}
        />
      </div>
      <div className="mb-2">
        <label>Send Email Reminder?</label>
        <input
          type="checkbox"
          name="send_email_reminder"
          checked={newMedicine.send_email_reminder}
          onChange={handleFormChange}
        />
      </div>
      <div className="mb-2">
        <label>Reminder Before (minutes)</label>
        <input
          type="number"
          name="reminder_minutes_before"
          className="form-control"
          value={newMedicine.reminder_minutes_before}
          onChange={handleFormChange}
        />
      </div>
      <button type="submit" className="btn btn-success">
        Save Medicine
      </button>
    </form>
  );
};

export default MedicineForm;
