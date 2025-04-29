import { useEffect } from "react";

const MedicineForm = (props) => {
  const { setFormData, formData, handleSubmit} = props;

  // React does not like input value being undefined and suddenly defined when typing
  const defaultFormData = {
    medicine_name: "",
    strength: "",
    amount: "",
    notes: "",
  };

  const mergedFormData = { ...defaultFormData, ...formData };

  // If editing existing data (put method)
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) {
      setFormData(defaultFormData);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { value, name } = e.target;

    if (/^\d*$/.test(value)) {
      if (name === "hour") {
        // For hours
        if (value === "" || parseInt(value) <= 23) {
          handleChange(e);
        } else {
          e.target.value = "";
        }
      } else if (name === "minute") {
        // For minutes
        if (value === "" || parseInt(value) <= 59) {
          handleChange(e);
        } else {
          e.target.value = "";
        }
        // For amount
      } else if (name === "amount") {
        if (value === "" || typeof parseInt(value) === "number") {
          handleChange(e);
        } else {
          e.target.value = "";
        }
      }
    } else {
      e.target.value = "";
    }
  };

  const isEditing = formData && formData.id;

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">
        {isEditing ? "Pakeisti egzistuojantį vaistą" : "Pridėti naują vaistą"}
      </h4>

      <div className="mb-2">
        <label>Vaisto pavadinimas</label>
        <input
          type="text"
          name="medicine_name"
          className="form-control"
          value={mergedFormData.medicine_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-2">
        <label>Stiprumas</label>
        <input
          type="text"
          name="strength"
          className="form-control"
          value={mergedFormData.strength}
          onChange={handleChange}
          required
          placeholder="pvz. 200mg"
        />
      </div>

      <div className="mb-2">
        <label>Kiekis (tabletės vienai dozei)</label>
        <input
          type="int"
          name="amount"
          placeholder="pvz.: 5"
          className="form-control"
          value={mergedFormData.amount}
          onChange={handleNumberChange}
          required
        />
      </div>

      <div className="mb-2">
        <label>Pastabos</label>
        <input
          type="text"
          name="notes"
          className="form-control"
          value={mergedFormData.notes}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-success">
        {isEditing ? "Atnaujinti" : "Išsaugoti"}
      </button>
    </form>
  );
};

export default MedicineForm;
