const AddUserForm = (props) => {
  const { formData, setFormData, handleSubmit } = props;

  const defaultFormData = {
    userEmail: "",
  };
  const mergedFormData = { ...defaultFormData, ...formData };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h4 className="mb-3">Išsiųsti užklausą esamo vartotojo el. paštu, kad galėtumėte jį stebėti.</h4>

        <div className="mb-2">
          <label>Vartotojo el. paštas</label>
          <input
            type="text"
            name="userEmail"
            placeholder="example@gmail.com"
            className="form-control"
            value={mergedFormData.userEmail}
            onChange={handleChange}
            required
          />
        </div>
      <button type="submit" className="btn btn-success">Išsiųsti užklausą</button>
      </form>
    </>
  );
};

export default AddUserForm;
