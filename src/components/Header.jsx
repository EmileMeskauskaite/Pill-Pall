import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

const Header = () => {
  const urlPath = useLocation().pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const caretakerData = localStorage.getItem("caretaker");
  const userData = localStorage.getItem("user");

  const handleLogOff = () => {
    localStorage.clear();
    setIsMenuOpen(false);
  };

  const userPage = userData ? "/profile-page/" + JSON.parse(userData)?.id?.toString() : "/";
  const caretakerPage = caretakerData ? "/profile-page/" + JSON.parse(caretakerData)?.id?.toString() : "/";

  return (
    <div className="container-fluid px-3 py-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ width: '100px' }}>
          {/* Logo */}
          <Link to="/">
            <img src={logo} style={{ width: "100px", height: "auto" }} alt="Logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="d-none d-md-flex gap-2">
          {!urlPath.includes("/profile-page/") && caretakerData && (
            <Link className="btn btn-info text-nowrap" to={caretakerPage}>
              Profile
            </Link>
          )}
          {!urlPath.includes("/profile-page/") && !caretakerData && userData && (
            <Link className="btn btn-info text-nowrap" to={userPage}>
              My Profile
            </Link>
          )}
          {!urlPath.includes("/caretaker-page/") && caretakerData && (
            <Link className="btn btn-warning" to="/caretaker-page">
              User List
            </Link>
          )}
          {(urlPath.includes("/schedule") || urlPath.includes("/reminder")) && (
            <Link className="btn btn-primary" to="/medicine">
              Medicine
            </Link>
          )}
          {(!urlPath.includes("/caretaker-page") && !urlPath.includes("/schedule")) && (
            <Link className="btn btn-primary" to="/schedule">
              Schedules
            </Link>
          )}
          <Link onClick={handleLogOff} to="/" className="btn btn-danger">
            Log Off
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="d-md-none ms-auto">
          <button
            className="btn p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ fontSize: '1.5rem' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="d-md-none mt-2">
          <div className="d-flex flex-column gap-2">
            {!urlPath.includes("/profile-page/") && caretakerData && (
              <Link className="btn btn-info w-100 text-nowrap" to={caretakerPage}>
                Profile
              </Link>
            )}
            {!urlPath.includes("/profile-page/") && !caretakerData && userData && (
              <Link className="btn btn-info w-100 text-nowrap" to={userPage}>
                My Profile
              </Link>
            )}
            {!urlPath.includes("/caretaker-page/") && caretakerData && (
              <Link className="btn btn-warning w-100" to="/caretaker-page">
                User List
              </Link>
            )}
            {(urlPath.includes("/schedule") || urlPath.includes("/reminder")) && (
              <Link className="btn btn-primary w-100" to="/medicine">
                Medicine
              </Link>
            )}
            {(!urlPath.includes("/caretaker-page") && !urlPath.includes("/schedule")) && (
              <Link className="btn btn-primary w-100" to="/schedule">
                Schedules
              </Link>
            )}
            <Link onClick={handleLogOff} to="/" className="btn btn-danger w-100">
              Log Off
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
