import "bootstrap-icons/font/bootstrap-icons.css";
import "../pages/styles.css";
import ConfirmNotification from "./notifications/ConfirmNotification";
import { useState } from "react";

const UsersList = (props) => {
  const { users, onUserClick, onUnlink } = props;
  const [showWarning, setShowWarning] = useState(false);
  const [selectedUser, setSelectedUser] = useState();

  if (!users) {
    return <h2>Loading list</h2>;
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
        <h2 className="h4 mb-3">List of connected users:</h2>
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
    </>
  );
};

export default UsersList;
