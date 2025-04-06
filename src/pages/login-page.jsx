import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [user, setUser] = useState({ name: '', id: '' });
  const [today, setToday] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    fetchSchedule(token);
  }, []);

  const fetchSchedule = async (token) => {
    try {
      const response = await fetch('http://localhost:5169/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    }
  };

  const handleMarkAsTaken = async (medicineId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5169/medicines/${medicineId}/taken`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSchedule(token);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const renderMedicineCard = (med, isToday) => {
    return med.times_per_day.map((time, i) => (
      <div key={`${med.id}-${time}-${i}`} className="border rounded p-2 mb-2">
        <strong>{med.medicine_name}</strong> – {med.strength} – {med.amount} tablet(s)
        <br />
        <span><strong>Time:</strong> {time}</span>
        <br />
        <span className={med.taken ? 'text-success' : 'text-danger'}>
          Status: {med.taken ? 'Taken' : 'Not taken'}
        </span>
        {isToday && !med.taken && (
          <div>
            <button
              className="btn btn-sm btn-outline-success mt-2"
              onClick={() => handleMarkAsTaken(med.id)}
            >
              Mark as Taken
            </button>
          </div>
        )}
      </div>
    ));
  };

  const renderWeeklyCalendar = () => {
    return (
      <div className="container">
        <div className="row text-center fw-bold">
          {daysOfWeek.map((day) => (
            <div key={day} className="col border p-2 bg-light">
              {day}
            </div>
          ))}
        </div>
        <div className="row">
          {daysOfWeek.map((day) => {
            const medsForDay = schedule.filter((med) => med.days_of_week.includes(day));
            const isToday = today === day;
  
            return (
              <div key={day} className="col border p-2" style={{ minHeight: '180px' }}>
                {medsForDay.length > 0 ? medsForDay.map((med) => (
                  med.times_per_day.map((time, i) => (
                    <div key={`${med.id}-${time}-${i}`} className={`mb-2 p-2 rounded ${isToday ? 'bg-warning-subtle' : 'bg-body-tertiary'}`}>
                      <div><strong>{med.medicine_name}</strong> – {med.strength}</div>
                      <div>{time} – {med.amount} tablet(s)</div>
                      <div className={med.taken ? 'text-success' : 'text-danger'}>
                        {med.taken ? 'Taken' : 'Not taken'}
                      </div>
                      {isToday && !med.taken && (
                        <button
                          className="btn btn-sm btn-outline-success mt-1"
                          onClick={() => handleMarkAsTaken(med.id)}
                        >
                          Mark as Taken
                        </button>
                      )}
                    </div>
                  ))
                )) : (
                  <div className="text-muted">–</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  const handleLogOff = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Welcome, {user.name}</h2>
      <div className="d-flex justify-content-end mb-3">
        <button onClick={handleLogOff} className="btn btn-danger">Log Off</button>
      </div>

      <h3 className="text-center mb-4">Your Weekly Medicine Schedule</h3>

      {renderWeeklyCalendar()}
    </div>
  );
};

export default SchedulePage;
