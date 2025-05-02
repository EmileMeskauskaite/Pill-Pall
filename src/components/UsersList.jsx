import "bootstrap-icons/font/bootstrap-icons.css";
import "../pages/styles.css";
import ConfirmNotification from "./notifications/ConfirmNotification";
import { useState } from "react";

const UsersList = (props) => {
  const { users, onUserClick, onUnlink } = props;
  const [showWarning, setShowWarning] = useState(false);
  const [selectedUser, setSelectedUser] = useState();

  if (!users) {
    return <h2>Add a user.</h2>;
  }

  const handleDelete = (userId) => {
    setShowWarning(true);
    setSelectedUser(userId);
  };
  const handleCancel = () => {
    setShowWarning(false);
    setSelectedUser(null);
  };
  const handleConfirm = () => {
    onUnlink(selectedUser);
    setShowWarning(false);
  }

  return (
    <>
      {showWarning && (
        <ConfirmNotification
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className="mt-4">
        <h2 className="h4 m-3">List of connected users:</h2>

        {/* Mobile Card View */}
        <div className="d-md-none">
          <div className="row row-cols-1 g-4">
            {users.map((user, index) => (
              <div key={user.id} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">
                        {user.name} {user.surname}
                      </h5>
                      <span className="badge bg-light text-dark">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Status:</span>
                        {user.confirmed ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : (
                          <i className="bi bi-x-circle-fill text-danger"></i>
                        )}
                      </div>
                    </div>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary py-2"
                        onClick={() => onUserClick(user.id, user.confirmed)}
                        title="View Profile"
                      >
                        <i className="bi bi-person me-2"></i>
                        View Profile
                      </button>
                      <button
                        className="btn btn-danger py-2"
                        onClick={() => handleDelete(user.id)}
                        title="Unlink User"
                      >
                        <i className="bi bi-trash me-2"></i>
                        Unlink User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="d-none d-md-block">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Connected User</th>
                <th scope="col" style={{ width: "2em" }}>
                  Confirmed?
                </th>
                <th scope="col" style={{ width: "7em" }}>
                  Unlink User
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="text-center">{index + 1}</td>
                  <td
                    className="text-primary connected-user-cell"
                    onClick={() => onUserClick(user.id, user.confirmed)}
                  >
                    {user.name} {user.surname}
                  </td>
                  <td className="text-center">
                    {user.confirmed ? (
                      <i className="bi bi-check-circle-fill text-success"></i>
                    ) : (
                      <i className="bi bi-x-circle-fill text-danger"></i>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user.id)}
                      title="Unlink User"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UsersList;
