import React, { useState, useEffect } from "react";

const ReminderModal = (props) => {
  const { reminder, onClose, refetch } = props;
  const userData = JSON.parse(localStorage.getItem("user"));
  const [taken, setTaken] = useState(reminder.taken);
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMedicineData = async () => {
    const medicineId = reminder.medicine_id;
    try {
      const response = await fetch(
        `http://localhost:5169/${userData.id}/medicines/${medicineId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicineData(data);
      } else {
        console.error("Nepavyko gauti vaisto duomenų");
      }
    } catch (error) {
      console.error("Klaida gaunant vaisto duomenis:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReminderTakenStatus = async (reminderId, takenStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5169/${userData.id}/${reminderId}/reminders`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
          body: JSON.stringify({ taken: takenStatus }),
        }
      );
      if (response.ok) {
        refetch();
        onClose();
      } else {
        console.error("Nepavyko atnaujinti priminimo");
      }
    } catch (error) {
      console.error("Klaida atnaujinant priminimą:", error);
    }
  };

  useEffect(() => {
    fetchMedicineData();
  }, [reminder.medicine_id]);

  if (loading) {
    return (
      <div className="form-modal-backdrop">
        <div className="reminder-modal-container">
          <p>Kraunama vaisto informacija…</p>
        </div>
      </div>
    );
  }

  const time = reminder.reminder_time.slice(0, 5);

  const toggleTaken = () => {
    const newStatus = !taken;
    setTaken(newStatus);
    updateReminderTakenStatus(reminder.id, newStatus);
  };

  return (
    <div className="form-modal-backdrop">
      <div className="reminder-modal-container">
        <div className="reminder-modal-header">
          <button
            className="reminder-modal-close-button"
            onClick={onClose}
            aria-label="Uždaryti"
          >
            &times;
          </button>
        </div>
        <div className="reminder-modal-body">
          <h2>{medicineData.medicine_name}</h2>
          <p>
            <strong>Stiprumas:</strong> {medicineData.strength}
          </p>
          <p>
            <strong>Kiekis:</strong> {medicineData.amount}
          </p>
          <p>
            <strong>Pastabos:</strong> {medicineData.notes || "-"}
          </p>
          <p>
            <strong>Priminimo data:</strong>{" "}
            {new Date(reminder.reminder_date).toLocaleDateString("lt-LT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Priminimo laikas:</strong> {time}
          </p>
          <div className="reminder-modal-checkbox-container">
            <label
              htmlFor="taken"
              className="d-flex gap-3 border rounded p-2"
              style={{ cursor: "pointer" }}
            >
              <span>Pažymėti kaip išgerta</span>
              <input
                type="checkbox"
                id="taken"
                checked={taken}
                onChange={toggleTaken}
                className="form-check-input"
                style={{ cursor: "pointer" }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
