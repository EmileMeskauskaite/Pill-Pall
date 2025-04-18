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

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr.slice(0, 5); // Show only HH:MM
    };

    return (
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
                        <th>Edit</th>
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
                            <td>{formatWeekday(reminder.week_day)}</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm"
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
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReminderList;
