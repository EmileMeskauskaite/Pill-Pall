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
        <h4 className="mb-3">Send request to existing user's email to monitor them.</h4>

        <div className="mb-2">
          <label>User's Email</label>
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
      <button type="submit" className="btn btn-success">Send Request</button>
      </form>
    </>
  );
};

export default AddUserForm;
