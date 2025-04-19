import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MedicineList from "../components/MedicineList";
import SuccessNotification from "../components/notifications/SuccessNotification";
import FormModal from "../components/forms/FormModal";
import MedicineForm from "../components/forms/MedicineForm";
// Making big changes
const MedicinePage = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [successShow, setSuccessShow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }

    fetchMedicines(userData);
  }, []);

  const fetchMedicines = async (userData) => {
    try {
      const userId = userData.id;
      const response = await fetch(
        `http://localhost:5169/${userId}/medicines`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (!response.ok) {
        navigate("/404");
      } else {
        const parsed = await response.json();
        setMedicines(parsed);
        return parsed;
      }
    } catch (err) {
      console.error("Could not fetch, has the server started?");
      // navigate("/");
    }
  };

  const refetchMedicines = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      fetchMedicines(userData);
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
    setEditingMedicine(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingMedicine
        ? `http://localhost:5169/${userData.id}/medicines/${editingMedicine.id}`
        : `http://localhost:5169/${userData.id}/medicines`;
  
      const method = editingMedicine ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${userData.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }
  
      handleSuccessNotification();
      refetchMedicines();
      handleCloseForm();
    } catch (err) {
      console.log(err.message || "Failed to submit form.");
    }
  };

  const handleEditButton = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };
const handleReminderButton = (medicineId) => {
  navigate(`/reminder/${medicineId}`);
}
  return (
    <>
      <Header />
      {successShow && <SuccessNotification />}
      {showForm && (
        <FormModal
          handleCloseModal={handleCloseForm}
          form={MedicineForm}
          submitFunction={handleFormSubmit}
          existingData={editingMedicine}
        />
      )}
      <div>
        <button
          style={{ width: "15em" }}
          className="btn btn-success"
          onClick={handleCreateButton}
        >
          Create New Medicine
        </button>
      </div>
      {medicines.length === 0 ? (
        <div>There are no medicines created.</div>
      ) : (
        <MedicineList
          onSuccessChange={handleSuccessNotification}
          medicines={medicines}
          refetch={refetchMedicines}
          onEdit={handleEditButton}
          onReminder={handleReminderButton}
        />
      )}
    </>
  );
};

export default MedicinePage;
