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
                console.warn("Missing user or medicine ID.");
                return;
            }
    
            const response = await fetch(
                `http://localhost:5169/reminders/${medicineId}`, 
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userData.token}`,
                    },
                }
            );
    
            if (!response.ok) {
                console.error("Failed to fetch reminders. Redirecting to 404.");
                navigate("/404");
                return;
            }
    
            const data = await response.json();
            setReminders(data);
            return data;
    
        } catch (err) {
            console.error("Error fetching reminders:", err);
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
            const url = editingReminder
                ? `http://localhost:5169/users/${userData.id}/rules/${editingReminder.id}`
                : `http://localhost:5169/rules`;

            const method = editingReminder ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    medicine_id: medicineId,
                    user_id: userData.id,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Something went wrong");
            }

            handleSuccessNotification();
            refetchReminders();
            handleCloseForm();
        } catch (err) {
            console.log(err.message || "Failed to submit form.");
        }
    };

    const handleEditButton = (reminder) => {
        setEditingReminder(reminder);
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
                    className="btn btn-success"
                    onClick={handleCreateButton}
                >
                    Create New Reminder
                </button>
            </div>
            {reminders.length === 0 ? (
                <div>There are no reminders created.</div>
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
