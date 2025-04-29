import "bootstrap-icons/font/bootstrap-icons.css";
import MedicineDeleteButton from "./buttons/MedicineDeleteButton";

const MedicineList = (props) => {
  const { medicines, refetch, onSuccessChange, onEdit, onReminder } = props;
  return (
    <>
      {/* Mobile Card View */}
      <div className="d-md-none">
        <div className="row row-cols-1 g-4 mt-3">
          {medicines.map((medicine, index) => (
            <div key={medicine.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{medicine.medicine_name}</h5>
                  <div className="card-text">
                    <p><strong>Stiprumas:</strong> {medicine.strength}</p>
                    <p><strong>Kiekis:</strong> {medicine.amount}</p>
                    {medicine.notes && <p><strong>Pastabos:</strong> {medicine.notes}</p>}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="btn-group w-100">
                      <button 
                        className="btn btn-primary flex-grow-1 py-2" 
                        onClick={() => onReminder(medicine.id)}
                        title="Nustatyti priminimą"
                      >
                        ⏰
                      </button>
                      <button 
                        className="btn btn-warning flex-grow-1 py-2" 
                        onClick={() => onEdit(medicine)}
                        title="Redaguoti"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <div className="btn btn-danger flex-grow-1">
                        <MedicineDeleteButton
                          medicineId={medicine.id}
                          refetch={refetch}
                          handleSuccess={onSuccessChange}
                          className="btn btn-danger w-100 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-md-block m-3">
        <table className="table table-striped table-bordered table-hover table-sm text-center">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Vaisto pavadinimas</th>
              <th>Stiprumas</th>
              <th>Kiekis</th>
              <th>Pastabos</th>
              <th>Priminimas</th>
              <th className="text-nowrap">Redaguoti</th>
              <th>Ištrinti</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine, index) => (
              <tr key={medicine.id}>
                <td>{index + 1}</td>
                <td>{medicine.medicine_name}</td>
                <td>{medicine.strength}</td>
                <td>{medicine.amount}</td>
                <td>{medicine.notes}</td>
                <td>
                  <button 
                    className="btn btn-primary py-2" 
                    onClick={() => onReminder(medicine.id)}
                    title="Nustatyti priminimą"
                  >
                    ⏰
                  </button>
                </td>
                <td>
                  <button 
                    className="btn btn-warning py-2" 
                    onClick={() => onEdit(medicine)}
                    title="Redaguoti"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
                <td>
                  <MedicineDeleteButton
                    medicineId={medicine.id}
                    refetch={refetch}
                    handleSuccess={onSuccessChange}
                    className="btn btn-danger py-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MedicineList;
