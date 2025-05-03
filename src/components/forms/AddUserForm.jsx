import React from "react";

const AddUserForm = (props) => {
  const { handleSubmit, formData, setFormData, errorMessage } = props;
  const defaultFormData = { userEmail: "" };
  const mergedFormData = { ...defaultFormData, ...formData };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">
        Siųsti pakvietimą esamo vartotojo el. pašto adresu.
      </h4>
      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}
      <div className="mb-2">
        <label>Vartotojo el. paštas</label>
        <input
          type="email"
          name="userEmail"
          placeholder="pvz., vardas@pastas.lt"
          className="form-control"
          value={mergedFormData.userEmail}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-success">
        Siųsti prašymą
      </button>
    </form>
  );
};

export default AddUserForm;
