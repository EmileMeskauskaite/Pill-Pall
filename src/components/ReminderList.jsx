import "bootstrap-icons/font/bootstrap-icons.css";
import ReminderDeleteButton from "./buttons/ReminderDeleteButton";

const ReminderList = ({ reminders, refetch, onSuccessChange, onEdit, onReminder }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatWeekday = (dayNumber) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[dayNumber] ?? "";
    };

<<<<<<< HEAD
<<<<<<< HEAD
    const formatWeekDays = (weekDays) => {
        if (!weekDays || !Array.isArray(weekDays)) return "";
        return weekDays.map(day => formatWeekday(day)).join(", ");
    };

=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
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
                                    <h5 className="card-title">Reminder #{index + 1}</h5>
                                    <div className="card-text">
<<<<<<< HEAD
<<<<<<< HEAD
                                        <p><strong>Minutės prieš:</strong> {reminder.reminder_minutes_before}</p>
                                        <p><strong>Pradžios data:</strong> {formatDate(reminder.start_date)}</p>
                                        <p><strong>Pabaigos data:</strong> {formatDate(reminder.end_date)}</p>
                                        <p><strong>Laikas:</strong> {formatTime(reminder.reminder_time)}</p>
                                        <p><strong>Savaitės dienos:</strong> {formatWeekDays(reminder.week_days)}</p>
=======
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
                                        <p><strong>Minutes Before:</strong> {reminder.reminder_minutes_before}</p>
                                        <p><strong>Start Date:</strong> {formatDate(reminder.start_date)}</p>
                                        <p><strong>End Date:</strong> {formatDate(reminder.end_date)}</p>
                                        <p><strong>Time:</strong> {formatTime(reminder.reminder_time)}</p>
                                        <p><strong>Day:</strong> {formatWeekday(reminder.week_day)}</p>
<<<<<<< HEAD
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
=======
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="btn-group w-100">
                                            <button 
                                                className="btn btn-warning flex-grow-1 py-2" 
                                                onClick={() => onEdit(reminder)}
                                                title="Edit"
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
                                <th>No.</th>
                                <th>Reminder Minutes Before</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Reminder Time</th>
                                <th>Week Day</th>
                                <th className="text-nowrap">Edit Item</th>
                                <th>Delete</th>
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
<<<<<<< HEAD
<<<<<<< HEAD
                                    <td>{formatWeekDays(reminder.week_days)}</td>
=======
                                    <td>{formatWeekday(reminder.week_day)}</td>
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
=======
                                    <td>{formatWeekday(reminder.week_day)}</td>
>>>>>>> parent of 1ecc078 (Translate user interface text to Lithuanian across multiple components, including forms, notifications, and pages. Update validation messages and button labels for better user experience in the Lithuanian language.)
                                    <td>
                                        <button
                                            className="btn btn-warning py-2"
                                            onClick={() => onEdit(reminder)}
                                            title="Edit"
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
