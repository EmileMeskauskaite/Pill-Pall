import { useState, useEffect } from "react";
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
        const caretakerDataParsed = JSON.parse(storedData);
        setCaretakerData(caretakerDataParsed);
      } catch (err) {
        console.error("Error parsing caretaker data:", err);
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
      const url = `http://localhost:5169/caretaker/${caretakerData.id}/users`;

      const method = "GET";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      } else {
        const data = await response.json();
        console.log(data);
        return data;
      }
    } catch (err) {
      console.log(err.message || "Failed to submit form.");
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
      const url = `http://localhost:5169/${caretakerData.id}/caretaker/remove-user`;

      const method = "DELETE";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
        body: JSON.stringify({ userId: userId, caretakerId: caretakerData.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      } else {
        handleSuccessNotification();
        refetchUsers();
      }
    } catch (err) {
      console.log(err.message || "Failed to delete.");
    }
  };

  const onUserClick = async (userId, confirmed) => {
    if (!confirmed) {
      alert("User hasn't been confirmed");
    } else {
      const userData = await fetchUserData(userId);
      localStorage.setItem("user", JSON.stringify({ ...userData.user, token: userData.token }));
      navigate('/schedule')
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const url = `http://localhost:5169/caretaker/user-data/${caretakerData.id}/${userId}`;

      const method = "GET";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      } else {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.log(err.message || "Failed to fetch user data");
    }
  };

  const handleFormSubmit = async (formData) => {
    const preparedForm = {
      ...formData,
      caretakerId: caretakerData.id,
      caretakerName: caretakerData.name,
      caretakerSurname: caretakerData.surname,
    };
    try {
      const url = `http://localhost:5169/${caretakerData.id}/caretaker/add-user`;
      
      const method = "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${caretakerData.token}`,
        },
        body: JSON.stringify(preparedForm),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      } else {
        handleSuccessNotification();
        handleCloseForm();
        refetchUsers();
      }
    } catch (err) {
      console.log(err.message || "Failed to submit form.");
    }
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

      <h1>Hello {caretakerData.name}</h1>
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-success"
          style={{ width: "6em" }}
          onClick={() => {
            setShowForm(true);
          }}
        >
          Add User To Monitor
        </button>

        <button
          className="btn btn-primary"
          style={{ width: "6em" }}
          onClick={refetchUsers}
        >
          Refresh List 🔃
        </button>
      </div>
      <UsersList users={users} onUnlink={onUnlink} onUserClick={onUserClick} />
    </>
  );
};

export default CaretakerPage;
