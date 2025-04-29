import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import ReminderList from "../components/ReminderList";
import SuccessNotification from "../components/notifications/SuccessNotification";
import FormModal from "../components/forms/FormModal";
import ReminderForm from "../components/forms/ReminderForm";

const ReminderPage = () => {
    const navigate = useNavigate();
    const { medicineId } = useParams();
    const [reminders, setReminders] = useState([]);
    const [successShow, setSuccessShow] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    const userData = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            if (!userData || !medicineId) {
                console.warn("Trūksta vartotojo arba vaisto ID.");
                return;
            }

            const response = await fetch(
                `http://localhost:5169/${userData.id}/reminders/${medicineId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userData.token}`,
                    },
                }
            );

            if (!response.ok) {
                console.error("Nepavyko gauti priminimų. Nukreipiama į 404.");
                navigate("/404");
                return;
            }

            const data = await response.json();
            setReminders(data);
            return data;

        } catch (err) {
            console.error("Klaida gaunant priminimus:", err);
        }
    };

    const refetchReminders = () => {
        if (userData) {
            fetchReminders();
        }
    };

    const handleSuccessNotification = () => {
        setSuccessShow(true);
        setTimeout(() => setSuccessShow(false), 3100);
    };

    const handleCreateButton = () => {
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingReminder(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Check if formData is an array (multiple reminders) or a single object
            const remindersToSubmit = Array.isArray(formData) ? formData : [formData];
            
            // Process each reminder
            for (const reminder of remindersToSubmit) {
                const url = editingReminder
                    ? `http://localhost:5169/${userData.id}/rules/${editingReminder.id}`
                    : `http://localhost:5169/${userData.id}/rules`;

                const method = editingReminder ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userData.token}`,
                    },
                    body: JSON.stringify({
                        ...reminder,
                        medicine_id: medicineId,
                        user_id: userData.id,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Įvyko klaida");
                }
            }

            handleSuccessNotification();
            refetchReminders();
            handleCloseForm();
        } catch (err) {
            console.error(err.message || "Nepavyko pateikti formos.");
        }
    };

    const handleEditButton = (reminder) => {
        const formatDate = (dateStr) => dateStr?.slice(0, 10) || "";
        const formatTime = (timeStr) => timeStr?.slice(0, 5) || "";

        const formattedReminder = {
            ...reminder,
            start_date: formatDate(reminder.start_date),
            end_date: formatDate(reminder.end_date),
            reminder_time: formatTime(reminder.reminder_time),
        };

        setEditingReminder(formattedReminder);
        setShowForm(true);
    };

    const handleReminderButton = (reminderId) => {
        navigate(`/reminder/${reminderId}`);
    };

    return (
        <>
            <Header />
            {successShow && <SuccessNotification />}
            {showForm && (
                <FormModal
                    handleCloseModal={handleCloseForm}
                    form={ReminderForm}
                    submitFunction={handleFormSubmit}
                    existingData={editingReminder}
                />
            )}
            <div>
                <button
                    style={{ width: "15em" }}
                    className="btn btn-success mx-3"
                    onClick={handleCreateButton}
                >
                    Sukurti naują priminimą
                </button>
            </div>
            {reminders.length === 0 ? (
                <div>Nėra sukurtų priminimų.</div>
            ) : (
                <ReminderList
                    onSuccessChange={handleSuccessNotification}
                    reminders={reminders}
                    refetch={refetchReminders}
                    onEdit={handleEditButton}
                    onReminder={handleReminderButton}
                />
            )}
        </>
    );
};

export default ReminderPage;