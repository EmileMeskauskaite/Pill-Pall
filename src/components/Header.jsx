import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/logo.png";

const Header = () => {
  const urlPath = useLocation().pathname;

  const handleLogOff = () => {
    localStorage.clear();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 mx-4">
        {/* Logo on the left */}
        <Link to="/schedule">
          <img src={logo} style={{ width: "100px", height: "auto" }} />
        </Link>

        {/* Buttons on the right */}
        <div className="d-flex gap-4">
          {/* Log Off Button */}
          <Link onClick={handleLogOff} to="/login" className="btn btn-danger">
            Log Off
          </Link>
          {/* Medicine Button */}
          {urlPath.includes("/schedule") && (
            <Link className="btn btn-primary" to="/medicine">
              Medicine
            </Link>
          )}
          {/* Schedules Button */}
          {urlPath.includes("/medicine") && (
            <Link className="btn btn-primary" to="/schedule">
              Schedules
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
