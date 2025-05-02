import "bootstrap-icons/font/bootstrap-icons.css";
import ReminderDeleteButton from "./buttons/ReminderDeleteButton";

const ReminderList = ({ reminders, refetch, onSuccessChange, onEdit, onReminder }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatWeekday = (dayNumber) => {
        const days = ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis"];
        return days[dayNumber] ?? "";
    };

    const formatWeekDays = (weekDays) => {
        if (!weekDays || !Array.isArray(weekDays)) return "";
        return weekDays.map(day => formatWeekday(day)).join(", ");
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr.slice(0, 5); // Show only HH:MM
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
                                        <p><strong>Savaitės dienos:</strong> {formatWeekDays(reminder.week_days)}</p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="btn-group w-100">
                                            <button 
                                                className="btn btn-warning flex-grow-1 py-2" 
                                                onClick={() => onEdit(reminder)}
                                                title="Redaguoti"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <div className="btn btn-danger flex-grow-1">
                                                <ReminderDeleteButton
                                                    reminderId={reminder.id}
                                                    refetch={refetch}
                                                    handleSuccess={onSuccessChange}
                                                    className="btn btn-danger w-100 py-2"
                                                />
                                            </div>
                                        </div>
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
                    <table className="table table-striped table-bordered table-hover table-sm text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nr.</th>
                                <th>Minutės prieš</th>
                                <th>Pradžios data</th>
                                <th>Pabaigos data</th>
                                <th>Priminimo laikas</th>
                                <th>Savaitės dienos</th>
                                <th className="text-nowrap">Redaguoti</th>
                                <th>Ištrinti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reminders.map((reminder, index) => (
                                <tr key={reminder.id}>
                                    <td>{index + 1}</td>
                                    <td>{reminder.reminder_minutes_before}</td>
                                    <td>{formatDate(reminder.start_date)}</td>
                                    <td>{formatDate(reminder.end_date)}</td>
                                    <td>{formatTime(reminder.reminder_time)}</td>
                                    <td>{formatWeekDays(reminder.week_days)}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning py-2"
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
                                            className="btn btn-danger py-2"
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
