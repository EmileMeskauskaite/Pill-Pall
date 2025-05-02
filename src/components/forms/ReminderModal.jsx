import React, { useState, useEffect } from "react";

const ReminderModal = (props) => {
  const { reminder, onClose, refetch } = props;
  const userData = JSON.parse(localStorage.getItem("user"));
  const [taken, setTaken] = useState(reminder.taken);
  const [medicineData, setMedicineData] = useState(null); // To hold the merged medicine data
  const [loading, setLoading] = useState(true); // To track loading state for fetching medicine data

  // Function to fetch medicine data
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
        setMedicineData(data); // Merge medicine data into state
        setLoading(false); // Set loading to false after fetching is done
      } else {
        console.error("Failed to fetch medicine data");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching medicine data:", error);
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
        console.error("Failed to update reminder");
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  // Toggle the "taken" checkbox is clicked
  const handleTakenChange = () => {
    const newTakenStatus = !taken;
    setTaken(newTakenStatus);
    updateReminderTakenStatus(reminder.id, newTakenStatus);
  };

  // Fetch medicine data when the component is mounted
  useEffect(() => {
    fetchMedicineData();
  }, [reminder.medicine_id]);

  // While waiting for medicine info to be fetched, display loading message
  if (loading) {
    return (
      <div className="form-modal-backdrop">
        <div className="reminder-modal-container">
          <p>Loading medicine data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-modal-backdrop">
      <div className="reminder-modal-container">
        <div className="reminder-modal-header">
          <button className="reminder-modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="reminder-modal-body">
          <h2>{medicineData?.medicine_name || reminder.medicine_name}</h2>
          <p>
            <strong>Strength:</strong>{" "}
            {medicineData?.strength || reminder.strength}
          </p>
          <p>
            <strong>Amount:</strong> {medicineData?.amount || reminder.amount}
          </p>
          <p>
            <strong>Notes:</strong> {medicineData?.notes || reminder.notes}
          </p>
          <p>
            <strong>Reminder Date:</strong>{" "}
            {new Date(reminder.reminder_date).toLocaleDateString()}
          </p>
          <p>
            <strong>Reminder Time:</strong> {reminder.reminder_time}
          </p>

          <div className="reminder-modal-checkbox-container">
            <label
              htmlFor="taken"
              className="d-flex gap-3 border rounded p-2"
              style={{
                cursor: "pointer",
              }}
            >
              <div>Mark as TAKEN</div>
              <input
                className="form-check-input"
                style={{
                  cursor: "pointer",
                }}
                type="checkbox"
                id="taken"
                checked={taken}
                onChange={handleTakenChange}
                disabled={loading} // Disable checkbox while loading
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
