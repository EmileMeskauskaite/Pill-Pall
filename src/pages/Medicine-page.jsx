import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MedicineList from "../components/MedicineList";
import Modal from "../components/Modal";

const MedicinePage = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [modal, setModal] = useState();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) {
      navigate("/login");
      return;
    }

    fetchMedicines(userData);
  }, [])

  const fetchMedicines = async (userData) => {
    try {
      const userId = userData.id;
      const response = await fetch(`http://localhost:5169/${userId}/medicines`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
      });
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
  }

  const refetchMedicines = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      fetchMedicines(userData);
    }
  };

  return (
    <>
      <Header />
      <div>
        <button style={{ width: "15em" }} className="btn btn-success ">Create New Medicine</button> 
        <Modal modal={modal} setModal={setModal} />
      </div>
      {medicines.length === 0 ? <div>There are no medicines</div> : <MedicineList medicines={medicines} refetch={refetchMedicines} />}
    </>
  );
};

export default MedicinePage;
