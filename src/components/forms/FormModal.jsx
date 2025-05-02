import "../../pages/styles.css";
import React, { useState, useEffect } from "react";

const FormModal = (props) => {
  const { handleCloseModal, form: FormComponent, submitFunction, existingData } = props;
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState(existingData || {});

  const closeModal = () => {
    setIsOpen(false);
    handleCloseModal();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitFunction(formData);
  }

  return (
    <div className="form-modal-backdrop">
      <div className="form-modal">
        <div className="form-modal-header d-flex">
          <button
            className="btn btn-secondary ms-auto"
            style={{
              width: "5em",
            }}
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "1.25em",
            fontWeight: "bold",
          }}
        >
          {/* Form Section */}
          <FormComponent handleSubmit={handleSubmit} formData={formData} setFormData={setFormData}/>  
        </div>
      </div>
    </div>
  );
};

export default FormModal;
