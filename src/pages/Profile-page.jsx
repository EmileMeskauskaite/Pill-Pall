import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SuccessNotification from "../components/notifications/SuccessNotification";

const ProfilePage = () => {
  const navigate = useNavigate();
  let userData;
  let userType;

  if (localStorage.getItem("caretaker")) {
    userData = JSON.parse(localStorage.getItem("caretaker"));
    userType = "caretaker";
  } else {
    userData = JSON.parse(localStorage.getItem("user"));
    userType = "user";
  }

  const [formData, setFormData] = useState({
    name: userData.name,
    surname: userData.surname,
    email: userData.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  const [successShow, setSuccessShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");

  const handleSuccessNotification = (message) => {
    setSuccessShow(true);
    setTimeout(() => setSuccessShow(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    localStorage.setItem(userType, JSON.stringify({ ...userData, [name]: value }));
  };

  const validatePassword = (password) => {
    if (password.length < 8)
      return "Slaptažodis turi būti bent 8 simbolių ilgio";
    if (!/[A-Z]/.test(password))
      return "Slaptažodis turi turėti bent vieną didžiąją raidę";
    if (!/[0-9]/.test(password))
      return "Slaptažodis turi turėti bent vieną skaičių";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = userData.token;
    if (!token) {
      setError("Autentifikacijos žetonas nerastas");
      return;
    }

    const endpoint =
      userType === "caretaker"
        ? `http://localhost:3000/caretaker/${userData.id}`
        : `http://localhost:3000/user/${userData.id}`;

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Nepavyko atnaujinti profilio");
      }
      handleSuccessNotification("✅ Profilis atnaujintas sėkmingai!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, repeatPassword } = passwordData;

    if (newPassword !== repeatPassword) {
      setError("Slaptažodžiai nesutampa");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const verifyResponse = await fetch("http://localhost:3000/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: currentPassword,
          type: userType,
        }),
      });
      if (!verifyResponse.ok) {
        setError("Neteisingas dabartinis slaptažodis");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/${userType}/${userData.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );
      if (!response.ok) {
        throw new Error("Nepavyko keisti slaptažodžio");
      }
      setShowPasswordModal(false);
      handleSuccessNotification("✅ Slaptažodis pakeistas sėkmingai!");
      setPasswordData({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    const token = userData.token;
    if (!token) {
      setError("Autentifikacijos žetonas nerastas");
      return;
    }

    const endpoint =
      userType === "caretaker"
        ? `http://localhost:3000/caretaker/${userData.id}`
        : `http://localhost:3000/user/${userData.id}`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Nepavyko ištrinti profilio");
      }
      localStorage.clear();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Header />
      {successShow && <SuccessNotification customMessage={""} />}
      <div
        className="d-flex justify-content-center align-items-start bg-light"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
          <h4 className="mb-4 text-center">Redaguoti profilį</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Vardas</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Pavardė</label>
              <input
                type="text"
                name="surname"
                className="form-control"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">El. paštas</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100 mb-2">
              Išsaugoti
            </button>
            <button
              type="button"
              className="btn btn-primary w-100 mb-2"
              onClick={() => setShowPasswordModal(true)}
            >
              Keisti slaptažodį
            </button>
            <button
              type="button"
              className="btn btn-danger w-100"
              onClick={() => setShowDeleteModal(true)}
            >
              Ištrinti profilį
            </button>
          </form>
        </div>
      </div>

      {showDeleteModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
          <div className="bg-white p-4 rounded shadow" style={{ width: '90%', maxWidth: '400px' }}>
            <p className="mb-3">⚠️ Ar tikrai norite ištrinti savo profilį?</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-danger me-2" onClick={handleDelete}>
                Taip
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Atšaukti
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
          <div className="bg-white p-4 rounded shadow" style={{ width: '90%', maxWidth: '400px' }}>
            <h5 className="mb-3">Keisti slaptažodį</h5>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label">Dabartinis slaptažodis</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Naujas slaptažodis</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Pakartokite naują slaptažodį</label>
                <input
                  type="password"
                  name="repeatPassword"
                  className="form-control"
                  value={passwordData.repeatPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      repeatPassword: "",
                    });
                  }}
                >
                  Atšaukti
                </button>
                <button type="submit" className="btn btn-success">
                  Keisti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
