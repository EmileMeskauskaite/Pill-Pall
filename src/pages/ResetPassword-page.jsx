import { useState } from "react";
import { useLocation, useParams, useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");  

  const isEmailForm = location.pathname.endsWith("/email");
  const isPasswordForm = location.pathname.endsWith("/password");
  const { type } = useParams();
  console.log(type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5169/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, type: type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Nepavyko išsiųsti atstatymo nuorodos.");
      }

      setSuccessMessage("Slaptažodžio atstatymo laiškas išsiųstas!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repeatPassword) {
      setError("Slaptažodžiai nesutampa.");
      return;
    }

    if (!token) {
      setError("Trūksta arba neteisingas raktas.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5169/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: formData.password,
          token
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Nepavyko atstatyti slaptažodžio.");
      }

      setSuccessMessage("Slaptažodis sėkmingai atnaujintas!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
    <button className="btn btn-secondary" style={{width:"5em"}} onClick={()=>{navigate("/")}}>Atgal</button>
      <form
        autoComplete="off"
        onSubmit={isEmailForm ? handleEmailSubmit : handlePasswordSubmit}
      >
        {isEmailForm && (
          <div className="mb-3">
            <label className="form-label">El. pašto adresas</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {isPasswordForm && (
          <>
            <div className="mb-3">
              <label className="form-label">Naujas slaptažodis</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Pakartokite slaptažodį</label>
              <input
                type="password"
                name="repeatPassword"
                className="form-control"
                value={formData.repeatPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          </>
        )}

        {error && <div className="text-danger mb-3">{error}</div>}
        {successMessage && <div className="text-success mb-3">{successMessage}</div>}

        <button type="submit" className="btn btn-success w-100">
          {isEmailForm ? "Išsiųsti atstatymo nuorodą" : "Pakeisti slaptažodį"}
        </button>
      </form>
    </>
  );
};

export default ResetPassword;
