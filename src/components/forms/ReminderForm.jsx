import { useEffect } from "react";

const ReminderForm = (props) => {
    const { setFormData, formData, handleSubmit } = props;

    const defaultFormData = {
        reminder_minutes_before: "0",
        start_date: "",
        end_date: "",
        reminder_time: "",
        week_day: "",
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

    return (
        <form onSubmit={handleSubmit} className="p-3">
            <h4 className="text-center mb-4">Add New Reminder</h4>

            <div className="mb-3">
                <label className="form-label fw-semibold">Reminder Minutes Before</label>
                <input
                    type="number"
                    name="reminder_minutes_before"
                    className="form-control"
                    value={formData.reminder_minutes_before || ""}
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

            <button type="submit" className="btn btn-success w-100">
                Submit
            </button>
        </form>
    );
};

export default ReminderForm;
