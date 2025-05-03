import React from "react";

const ConfirmNotification = (props) => {
  const { onConfirm, onCancel, customMessage } = props;

  return (
    <div className="modal-backdrop">
      <div className="warning-box alert alert-danger">
        {customMessage ? (
          <p>{customMessage}</p>
        ) : (
          <p>⚠️ Ar tikrai norite ištrinti šį elementą?</p>
        )}
        <div className="modal-buttons">
          <button className="btn btn-danger btn-sm me-2" onClick={onConfirm}>
            Taip
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            Atšaukti
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNotification;
