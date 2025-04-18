import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmNotification from "../notifications/ConfirmNotification";

const MedicineDeleteButton = (props) => {
  const navigate = useNavigate();
  const { medicineId, refetch, handleSuccess } = props;
  const userData = JSON.parse(localStorage.getItem("user"));
  const [showWarning, setShowWarning] = useState(false);

  const handleConfirm = () => {
    setShowWarning(false);
    deleteMedicine();
  }

  const handleCancel = () => {
    setShowWarning(false);
  }

  const handleClick = () => {
    setShowWarning(true);
  }
  const deleteMedicine = async () => {
    setShowWarning(false);
    try {
      const userId = userData.id;
      const response = await fetch(
        `http://localhost:5169/${userId}/medicines/${medicineId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (!response.ok) {
        navigate("/404");
      } else {
        refetch();
        handleSuccess();
      }
    } catch (err) {
      console.error("Could not fetch, has the server started?");
    }
  };

  return (
    <>
      {showWarning && <ConfirmNotification onConfirm={handleConfirm} onCancel={handleCancel}/>}
      <button className="btn btn-danger btn-sm" onClick={handleClick}>
        <i className="bi bi-trash"></i>
      </button>
    </>
  );
};

export default MedicineDeleteButton;
