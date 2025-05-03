import "../../pages/styles.css";
import React, { useState } from "react";

const FormModal = (props) => {
  const {
    handleCloseModal,
    form: FormComponent,
    submitFunction,
    existingData,
  } = props;

  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState(existingData || {});
  const [error, setError] = useState(null);

  const closeModal = () => {
    setIsOpen(false);
    handleCloseModal();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await submitFunction(formData);
    } catch (err) {
      setError(err.message || "Įvyko klaida");
    }
  };

  return (
    <div className="form-modal-backdrop">
      <div className="form-modal">
        <div className="form-modal-header d-flex justify-content-between">
          <div></div> 
          <button
            className="btn-light mb-2"
            aria-label="Close"
            onClick={() => { closeModal(); }}
          >
            Atšaukti
          </button>
        </div>
        <div className="p-3">
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}
          <FormComponent
            handleSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  );
};

export default FormModal;
