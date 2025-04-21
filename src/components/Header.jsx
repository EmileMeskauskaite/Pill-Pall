import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const urlPath = useLocation().pathname;

  const caretakerData = localStorage.getItem("caretaker");
  const userData = localStorage.getItem("user");

  const handleLogOff = () => {
    localStorage.clear();
  };

  const userPage = userData ? "/profile-page/" + JSON.parse(userData)?.id?.toString() : "/";
  const caretakerPage = caretakerData ? "/profile-page/" + JSON.parse(caretakerData)?.id?.toString() : "/";

  return (
    <div className="container-fluid px-3 py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* Logo */}
        <Link to="/">
          <img src={logo} style={{ width: "100px", height: "auto" }} alt="Logo" />
        </Link>

        {/* Profile Button */}
        <div className="d-flex flex-column flex-sm-row gap-2">
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
    </div>
  );
};

export default Header;
