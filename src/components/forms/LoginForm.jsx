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
    if (userType == "caretaker") {
      try {
        const response = await fetch("http://localhost:5169/caretaker/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to login");
        }

        const userData = await response.json();

        const userWithToken = {
          ...userData.user,
          token: userData.token
        };
        
        localStorage.setItem("caretaker", JSON.stringify(userWithToken));
        navigate("/caretaker-page");
      } catch (error) {
        setErrorMessage(error.message);
        setShowErrorModal(true);
      }
    } else {
      try {
        const response = await fetch("http://localhost:5169/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to login");
        }

        const userData = await response.json();

        const userWithToken = {
          ...userData.user,
          token: userData.token
        };
        
        localStorage.setItem("user", JSON.stringify(userWithToken));
        navigate("/schedule");
      } catch (error) {
        setErrorMessage(error.message);
        setShowErrorModal(true);
      }
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
          ← Back
        </button>

        {userType == "caretaker" ? (
          <>
            <h5 className="text-center border rounded p-3 bg-light">
              Easily monitor the medication intake of family members or clients!
            </h5>
            <h2 className="text-center mb-4">Caretaker Login</h2>
          </>
        ) : (
          <h2 className="text-center mb-4">Login</h2>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
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
            <label className="form-label">Password</label>
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
            Log in
          </button>
        </form>
        {userType == "caretaker" ? (
          <p className="text-center mt-3">
            Don't have a caretaker account?
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/caretaker-register")}
            >
              Register one here
            </button>
          </p>
        ) : (
          <p className="text-center mt-3">
            Don't have an account?
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/register")}
            >
              Register here
            </button>
          </p>
        )}
        <p className="text-center mt-3">
          Forgot password?
          <button
            className="btn btn-link p-0"
            onClick={() => navigate(`/reset-password/${userType}/email`)}
          >
            Reset password here
          </button>
        </p>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Login Failed</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowErrorModal(false)}
                ></button>
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
                  Close
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
