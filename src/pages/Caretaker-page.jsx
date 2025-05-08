import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AddUserForm from "../components/forms/AddUserForm";
import FormModal from "../components/forms/FormModal";
import SuccessNotification from "../components/notifications/SuccessNotification";
import UsersList from "../components/UsersList";

const CaretakerPage = () => {
  const [caretakerData, setCaretakerData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successShow, setSuccessShow] = useState(false);
  const [users, setUsers] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("caretaker");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setCaretakerData(parsed);
      } catch (err) {
        console.error("Klaida skaitant prižiūrėtojo duomenis:", err);
        navigate("/caretaker-login");
      }
    } else {
      navigate("/caretaker-login");
    }
  }, []);

  useEffect(() => {
    if (caretakerData) {
      refetchUsers();
    }
  }, [caretakerData]);

  const refetchUsers = async () => {
    const list = await fetchUsers();
    setUsers(list);
  };

  const fetchUsers = async () => {
    try {
      const url = `http://localhost:3000/caretaker/${caretakerData.id}/users`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Įvyko klaida");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err.message || "Nepavyko gauti vartotojų sąrašo.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSuccessNotification = () => {
    setSuccessShow(true);
    setTimeout(() => setSuccessShow(false), 3100);
  };

  const onUnlink = async (userId) => {
    try {
      const url = `http://localhost:3000/${caretakerData.id}/caretaker/remove-user`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
        body: JSON.stringify({
          userId: userId,
          caretakerId: caretakerData.id,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Įvyko klaida");
      }
      handleSuccessNotification();
      refetchUsers();
    } catch (err) {
      console.error(err.message || "Nepavyko pašalinti vartotojo.");
    }
  };

  const onUserClick = async (userId, confirmed) => {
    if (!confirmed) {
      alert("Vartotojas dar nepatvirtintas");
    } else {
      const userData = await fetchUserData(userId);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userData.user, token: userData.token })
      );
      navigate("/schedule");
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const url = `http://localhost:3000/caretaker/user-data/${caretakerData.id}/${userId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Įvyko klaida");
      }
      return await response.json();
    } catch (err) {
      console.error(err.message || "Nepavyko gauti vartotojo duomenų");
    }
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      caretakerId: caretakerData.id,
      caretakerName: caretakerData.name,
      caretakerSurname: caretakerData.surname,
    };
  
    const url = `http://localhost:3000/${caretakerData.id}/caretaker/add-user`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${caretakerData.token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Toks vartotojas neegzistuoja");
    }
  
    handleSuccessNotification();
    handleCloseForm();
    refetchUsers();
  };

  if (!caretakerData) return null;

  return (
    <>
      <Header />
      {successShow && <SuccessNotification />}

      {showForm && (
        <FormModal
          handleCloseModal={handleCloseForm}
          form={AddUserForm}
          submitFunction={handleFormSubmit}
        />
      )}

      <h1 className="text-center">Sveiki, {caretakerData.name}</h1>

      <div className="d-flex justify-content-between m-3">
        <button
          className="btn btn-success"
          style={{ width: "6em" }}
          onClick={() => setShowForm(true)}
        >
          Pridėti vartotoją
        </button>
        <button
          className="btn btn-primary"
          style={{ width: "6em" }}
          onClick={refetchUsers}
        >
          Atnaujinti 🔃
        </button>
      </div>

      <UsersList
        users={users}
        onUnlink={onUnlink}
        onUserClick={onUserClick}
      />
    </>
  );
};

export default CaretakerPage;
