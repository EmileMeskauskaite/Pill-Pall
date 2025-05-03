import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginForm = (props) => {
  const { userType } = props;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    localStorage.clear();
  }, []);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint =
      userType === "caretaker"
        ? "http://localhost:5169/caretaker/login"
        : "http://localhost:5169/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Prisijungti nepavyko");
      }

      const userData = await response.json();
      const userWithToken = { ...userData.user, token: userData.token };
      const storageKey = userType === "caretaker" ? "caretaker" : "user";
      localStorage.setItem(storageKey, JSON.stringify(userWithToken));

      if (userType === "caretaker") {
        navigate("/caretaker-page");
      } else {
        navigate("/schedule");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", width: "100vw" }}
      className="d-flex justify-content-center align-items-center bg-light"
    >
      <div
        style={{ maxWidth: "420px", width: "100%", backgroundColor: "white" }}
        className="p-4 rounded shadow position-relative"
      >
        <button className="btn-light mb-2" onClick={() => navigate("/")}>
          ← Atgal
        </button>

        {userType === "caretaker" ? (
          <>
            <h5 className="text-center border rounded p-3 bg-light">
              Lengvai stebėkite vaistų vartojimą šeimos nariams ar klientams!
            </h5>
            <h2 className="text-center mb-4">Prižiūrėtojo prisijungimas</h2>
          </>
        ) : (
          <h2 className="text-center mb-4">Prisijungimas</h2>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
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
          <div className="mb-3">
            <label className="form-label">Slaptažodis</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Prisijungti
          </button>
        </form>

        {userType === "caretaker" ? (
          <p className="text-center mt-3">
            Neturite prižiūrėtojo paskyros?{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/caretaker-register")}
            >
              Užsiregistruokite čia
            </button>
          </p>
        ) : (
          <p className="text-center mt-3">
            Neturite paskyros?{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/register")}
            >
              Registruotis čia
            </button>
          </p>
        )}

        <p className="text-center mt-3">
          Pamiršote slaptažodį?{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => navigate(`/reset-password/${userType}/email`)}
          >
            Atstatyti slaptažodį
          </button>
        </p>
      </div>

      {showErrorModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Prisijungti nepavyko</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowErrorModal(false)}
                  aria-label="Uždaryti"
                />
              </div>
              <div className="modal-body">
                <p>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowErrorModal(false)}
                >
                  Uždaryti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
