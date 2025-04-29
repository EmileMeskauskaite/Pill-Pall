import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../pages/styles.css";

const RegisterForm = (props) => {
  const { userType } = props;
  const [form, setForm] = useState({
    name: "",
    surname: "",
    date_of_birth: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  useEffect(() => {
    localStorage.clear();
  }, []);

  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, surname, date_of_birth, email, password, repeatPassword } =
      form;

    if (
      !name ||
      !surname ||
      !date_of_birth ||
      !email ||
      !password ||
      !repeatPassword
    ) {
      setError("Prašome užpildyti visus laukus");
      return;
    }

    if (password !== repeatPassword) {
      setError("Slaptažodžiai nesutampa");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (userType == "caretaker") {
      try {
        const response = await fetch(
          "http://localhost:5169/caretaker/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              surname,
              date_of_birth,
              email,
              password,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Nepavyko užsiregistruoti");
        }

        setShowSuccessModal(true);
      } catch (err) {
        setError(err.message || "Registracija nepavyko.");
      }
    } else {
      try {
        const response = await fetch("http://localhost:5169/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            surname,
            date_of_birth,
            email,
            password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Nepavyko užsiregistruoti");
        }

        setShowSuccessModal(true);
      } catch (err) {
        setError(err.message || "Registracija nepavyko.");
      }
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", width: "100vw" }}
      className="d-flex justify-content-center align-items-center bg-light"
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: "white",
          position: "relative",
        }}
        className="p-4 rounded shadow"
      >
        <button
          className="btn-light mb-2"
          onClick={() => window.history.back()}
        >
          ← Grįžti
        </button>

        {userType == "caretaker" ? (
          <h2 className="text-center mb-4">Prižiūrėtojo registracija</h2>
        ) : (
          <h2 className="text-center mb-4">Registracija</h2>
        )}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Vardas</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Pavardė</label>
            <input
              type="text"
              name="surname"
              className="form-control"
              value={form.surname}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Gimimo data</label>
            <input
              type="date"
              name="date_of_birth"
              className="form-control"
              value={form.date_of_birth}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">El. paštas</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Slaptažodis</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Pakartokite slaptažodį</label>
            <input
              type="password"
              name="repeatPassword"
              className="form-control"
              value={form.repeatPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Registruotis
          </button>
        </form>
        {userType == "caretaker" ? (
          <p className="text-center mt-3">
            Jau turite prižiūrėtojo paskyrą?{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/caretaker-login")}
            >
              Prisijunkite čia
            </button>
          </p>
        ) : (
          <p className="text-center mt-3">
            Jau turite paskyrą?{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/login")}
            >
              Prisijunkite čia
            </button>
          </p>
        )}
      </div>

      {/* ✅ Error Modal */}
      {error && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">
                    Registracijos klaida
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{error}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setError(null)}
                  >
                    Uždaryti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-success">
                    Registracija sėkminga
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSuccessModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Registracija sėkmingai užbaigta!</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate("/login");
                    }}
                  >
                    Prisijungti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterForm;
