import { useEffect } from "react";

const MedicineForm = (props) => {
  const { setFormData, formData, handleSubmit} = props;

  const defaultFormData = {
    medicine_name: "",
    strength: "",
    amount: "",
    notes: "",
  };

  const mergedFormData = { ...defaultFormData, ...formData };

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
    console.log('YES');
    const { value, name } = e.target;

    if (/^\d*$/.test(value)) {
      if (name === "hour") {
        if (value === "" || parseInt(value) <= 23) {
          handleChange(e);
        } else {
          e.target.value = "";
        }
      } else if (name === "minute") {
        if (value === "" || parseInt(value) <= 59) {
          handleChange(e);
        } else {
          e.target.value = "";
        }
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

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">Sukurti naują vaistą</h4>

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
          placeholder="e.g. 200mg"
        />
      </div>

      <div className="mb-2">
        <label>Kiekis (tabletės per dozę)</label>
        <input
          type="int"
          name="amount"
          placeholder="e.g.: 5"
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

      <button type="submit" className="btn btn-success">Išsaugoti</button>
    </form>
  );
};

export default MedicineForm;
