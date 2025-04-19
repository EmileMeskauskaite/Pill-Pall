import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/logo.png";

const Header = () => {
  const urlPath = useLocation().pathname;

  const caretakerData = localStorage.getItem("caretaker");
  const handleLogOff = () => {
    localStorage.clear();
  };
  const userData = localStorage.getItem("user");
  const userPage ="/profile-page/" + JSON.parse(userData)?.id?.toString();
  const caretakerPage = "/profile-page/" +JSON.parse(caretakerData)?.id?.toString();
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 mx-4">
        {/* Logo on the left */}
        <Link to="">
          <img src={logo} style={{ width: "100px", height: "auto" }} />
        </Link>
        {/* User profile button*/}
        {!urlPath.includes("/profile-page/:userId") && caretakerData && (
            <Link
              className="btn btn-info"
              to={caretakerPage}
              style={{ width: "200px" }}
            >
              My Profile
            </Link>
          )}
            {!urlPath.includes("/profile-page/:userId") && !caretakerData && (
            <Link
              className="btn btn-info"
              to={userPage}
              style={{ width: "200px" }}
            >
              My Profile
            </Link>
          )}
        <div className="d-flex gap-4">
          {/* Go back to caretaker page */}
          {!urlPath.includes("/caretaker-page/") && caretakerData && (
            <Link
              className="btn btn-warning"
              to="/caretaker-page"
              style={{ width: "200px" }}
            >
              User List
            </Link>
          )}
          {/* Medicine Button */}
          {(urlPath.includes("/schedule") || urlPath.includes("/reminder")) && (
            <Link
              className="btn btn-primary"
              to="/medicine"
              style={{ width: "200px" }}
            >
              Medicine
            </Link>
          )}

          {/* Schedules Button */}
          {(urlPath.includes("/medicine") || urlPath.includes("/profile-page")) && (
            <Link
              className="btn btn-primary"
              to="/schedule"
              style={{ width: "200px" }}
            >
              Schedules
            </Link>
          )}
          {/* Log Off Button */}
          <Link
            onClick={handleLogOff}
            to="/login"
            className="btn btn-danger"
            style={{ width: "200px" }}
          >
            Log Off
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
