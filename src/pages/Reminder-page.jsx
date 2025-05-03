import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import ReminderList from "../components/ReminderList";
import SuccessNotification from "../components/notifications/SuccessNotification";
import "bootstrap-icons/font/bootstrap-icons.css";
import ReminderDeleteButton from "../components/buttons/ReminderDeleteButton";

const ReminderPage = () => {
  const navigate = useNavigate();
  const { medicineId } = useParams();
  const [reminders, setReminders] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    reminder_minutes_before: "0",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    reminder_time: "12:00",
    week_days: []
  });
  const user = JSON.parse(localStorage.getItem("user"));

  // Modal styles
  const backdropStyle = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  };
  const modalStyle = {
    background: '#fff', padding: '1rem', borderRadius: '0.5rem',
    maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxHeight: '95vh', overflowY: 'auto'
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch(
        `http://localhost:5169/${user.id}/reminders/${medicineId}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } }
      );
      if (!res.ok) return navigate("/404");
      setReminders(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const notify = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const weekDays = [
    { id: "0", name: "Sekmadienis" }, { id: "1", name: "Pirmadienis" },
    { id: "2", name: "Antradienis" }, { id: "3", name: "Trečiadienis" },
    { id: "4", name: "Ketvirtadienis" }, { id: "5", name: "Penktadienis" },
    { id: "6", name: "Šeštadienis" }
  ];

  const openCreate = () => {
    setEditing(null);
    setFormData({
      reminder_minutes_before: "0",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      reminder_time: "12:00",
      week_days: []
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      reminder_minutes_before: String(item.reminder_minutes_before),
      start_date: item.start_date.slice(0, 10),
      end_date: item.end_date.slice(0, 10),
      reminder_time: item.reminder_time.slice(0, 5),
      week_days: item.week_days.map(String)
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNum = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value) && (value === "" || (+value >= 0 && +value <= 60))) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleDay = (id) => {
    setFormData(prev => {
      const days = prev.week_days.includes(id) ? prev.week_days.filter(d => d !== id) : [...prev.week_days, id];
      return { ...prev, week_days: days };
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (formData.week_days.length === 0) {
      alert("Pasirinkite bent vieną savaitės dieną");
      return;
    }
    try {
      const url = editing ?
        `http://localhost:5169/${user.id}/rules/${editing.id}` :
        `http://localhost:5169/${user.id}/rules`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          reminder_minutes_before: +formData.reminder_minutes_before,
          week_days: formData.week_days.map(Number),
          medicine_id: +medicineId,
          user_id: user.id
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      notify(); fetchReminders(); setShowForm(false);
    } catch (err) {
      console.error(err); alert(err.message);
    }
  };

  return (
    <>
      <Header />
      {showSuccess && <SuccessNotification />}
      <div className="container-fluid mt-4 mb-4">

        <button className="btn btn-success mx-3" style={{ width: "15em" }} onClick={openCreate}>
          {editing ? "Redaguoti priminimą" : "Sukurti priminimą"}
        </button>
        {showForm && (
          <div style={backdropStyle}>
            <div style={modalStyle}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>{editing ? "Redaguoti priminimą" : "Naujas priminimas"}</h4>
                <button
                  className="btn-light mb-2"
                  aria-label="Close"
                  onClick={() => setShowForm(false)} 
                >
                  Atšaukti
                </button>


              </div>
              <form onSubmit={submitForm}>
                <div className="mb-3">
                  <label>Priminimo minutės prieš</label>
                  <input type="number" name="reminder_minutes_before"
                    className="form-control"
                    value={formData.reminder_minutes_before}
                    onChange={handleNum}
                    min="0" max="60" required />
                </div>
                <div className="mb-3">
                  <label>Pradžios data</label>
                  <input type="date" name="start_date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label>Pabaigos data</label>
                  <input type="date" name="end_date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label>Priminimo laikas</label>
                  <input type="time" name="reminder_time"
                    className="form-control"
                    value={formData.reminder_time}
                    onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label>Savaitės dienos</label>
                  <div className="d-flex flex-wrap gap-2">
                    {weekDays.map(w => (
                      <label key={w.id} className="form-check-label me-2">
                        <input type="checkbox"
                          checked={formData.week_days.includes(w.id)}
                          onChange={() => toggleDay(w.id)} /> {w.name}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  {editing ? "Išsaugoti" : "Sukurti"}
                </button>
              </form>
            </div>
          </div>
        )}
        {reminders.length === 0 ? (
          <p>Nėra priminimų</p>
        ) : (
          <ReminderList reminders={reminders}
            refetch={fetchReminders}
            onSuccessChange={notify}
            onEdit={openEdit}
            onReminder={id => navigate(`/reminder/${id}`)} />
        )}
      </div>
    </>
  );
};

export default ReminderPage;
