import React, { useState } from "react";

const ConfirmNotification = (props) => {
  const { onConfirm, onCancel, customMessage } = props;

  return (
    <div className="modal-backdrop">
      <div className="warning-box alert alert-danger">
        {customMessage ? (
          <p>{customMessage}</p>
        ) : (
          <p>⚠️ Are you sure you want to delete this item?</p>
        )}
        <div className="modal-buttons">
          <button className="btn btn-danger btn-sm me-2" onClick={onConfirm}>
            OK
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNotification;
