import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

const MedicineDeleteButton = (props) => {
  const navigate = useNavigate();
  const {medicineId, refetch} = props;
  const userData = JSON.parse(localStorage.getItem("user"));

  const deleteMedicine = async () => {
    try {
      const userId = userData.id;
      const response = await fetch(`http://localhost:5169/${userId}/medicines/${medicineId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
      });
      if (!response.ok) {
        navigate("/404");
      } else {
        refetch();
        // TODO - add a "Successfully deleted notification"
      }
    } catch (err) {
      console.error("Could not fetch, has the server started?");
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={deleteMedicine}>
      <i className="bi bi-trash"></i>{" "}
    </button>
  );
};

export default MedicineDeleteButton;
