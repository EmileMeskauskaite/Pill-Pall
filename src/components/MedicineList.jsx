import "bootstrap-icons/font/bootstrap-icons.css";
import MedicineDeleteButton from "./buttons/MedicineDeleteButton";

const MedicineList = (props) => {
  const { medicines, refetch } = props;
  return (
    <table className="table table-striped table-bordered table-hover table-sm text-center">
      <thead>
        <tr>
          <th>No.</th>
          <th>Medicine Name</th>
          <th>Strength</th>
          <th>Notes</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {medicines.map((e, index) => {
          return (
            <tr key={e.id}>
              <td>{index + 1}</td>
              <td>{e.medicine_name}</td>
              <td>{e.strength}</td>
              <td>{e.notes}</td>
              <td>
                {/* Edit Button */}
                <button className="btn btn-warning btn-sm">
                  <i className="bi bi-pencil-square"></i>{" "}
                </button>
              </td>
              <td>
                <MedicineDeleteButton medicineId={e.id} refetch={refetch} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default MedicineList;


