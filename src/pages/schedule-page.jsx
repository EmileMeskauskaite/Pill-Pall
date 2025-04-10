import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SchedulePage = () => {
    const [schedule, setSchedule] = useState([]);
    const [user, setUser] = useState({ name: 'User', email: '', id: '' });
    const [showForm, setShowForm] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        medicine_name: '',
        strength: '',
        amount: 1,
        times_per_day: ['08:00'],
        start_date: '',
        end_date: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reminder_minutes_before: 30,
        send_email_reminder: true,
        repeat_type: 'weekly',
        days_of_week: [],
        interval_days: null,
        cycle_on_days: null,
        cycle_off_days: null,
        notes: '',
        taken: false
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(storedUser);
            fetchSchedule(token);
        } else {
            navigate('/login');
        }
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
            } else {
                console.error('Failed to fetch schedule');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleLogOff = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleAddMedicine = () => {
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'days_of_week') {
            setNewMedicine((prev) => ({
                ...prev,
                days_of_week: checked
                    ? [...prev.days_of_week, value]
                    : prev.days_of_week.filter((d) => d !== value)
            }));
        } else {
            setNewMedicine((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5169/medicines/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newMedicine),
            });

            if (response.ok) {
                setNewMedicine({
                    medicine_name: '',
                    strength: '',
                    amount: 1,
                    times_per_day: '',
                    start_date: '',
                    end_date: '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    reminder_minutes_before: 30,
                    send_email_reminder: true,
                    repeat_type: 'weekly',
                    days_of_week: [],
                    interval_days: null,
                    cycle_on_days: null,
                    cycle_off_days: null,
                    notes: '',
                    taken: false
                });
                setShowForm(false);
                fetchSchedule(token);
            } else {
            }
        } catch (err) {
            console.error('Error:', err);
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
            } else {
                console.error('Failed to update taken status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderWeeklyCalendar = () => {
        return (
            <div className="container px-2">
                {/* Weekday headers */}
                <div className="row text-center fw-bold mb-2">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="col border bg-light py-2">
                            {day === today ? (
                                <span className="text-primary">{day} (Today)</span>
                            ) : (
                                <span>{day}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Medicine per day */}
                <div className="row text-center">
                    {daysOfWeek.map((day) => {
                        const medsForDay = schedule.filter((med) => med.days_of_week.includes(day));
                        const isToday = today === day;

                        return (
                            <div key={day} className="col border" style={{ minHeight: '200px' }}>
                                {medsForDay.length > 0 ? (
                                    medsForDay.map((med) =>
                                        med.times_per_day.map((time, i) => (
                                            <div
                                                key={`${med.id}-${time}-${i}`}
                                                className={`mb-2 p-2 rounded small ${
                                                    isToday ? 'bg-warning-subtle' : 'bg-body-tertiary'
                                                }`}
                                            >
                                                <div><strong>{med.medicine_name}</strong> – {med.strength}</div>
                                                <div>{time} – {med.amount} tablet(s)</div>
                                                {med.notes && <div className="fst-italic small">{med.notes}</div>}
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
                                    )
                                ) : (
                                    <div className="text-muted mt-3">No meds</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const [pillAmount, setPillAmount] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const handleNumberChange = (e) => {
        const { value, name } = e.target; 
        
        if (/^\d*$/.test(value)) {
          if (name === 'hour') {
            // For hours
            if (value === '' || parseInt(value) <= 23) {
              setHours(value);
            } else {
              e.target.value = '';
            }
          } else if (name === 'minute') {
            // For minutes
            if (value === '' || parseInt(value) <= 59) {
              setMinutes(value);
            } else {
              e.target.value = '';
            }
            // For amount
          } else if (name === 'amount') {
            if (value === '' || typeof parseInt(value) === 'number') {
                setPillAmount(value);
            } else {
                e.target.value = '';
            }
          }
        } else {
          e.target.value = '';
        }
      };
    

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Welcome, {user.name}</h2>
            <div className="d-flex justify-content-end mb-3 gap-2">
                <button onClick={handleLogOff} className="btn btn-danger">Log Off</button>
                <button onClick={handleAddMedicine} className="btn btn-primary">Add Medicine</button>
            </div>

            <h3 className="text-center mb-4">Weekly Pill Calendar</h3>
            {renderWeeklyCalendar()}

            {showForm && (
                <form onSubmit={handleFormSubmit} className="mt-5 border p-3 rounded bg-light">
                    <h4 className="mb-3">Add New Medicine</h4>

                    <div className="mb-2">
                        <label>Medicine Name</label>
                        <input type="text" name="medicine_name" className="form-control" value={newMedicine.medicine_name} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                        <label>Strength (e.g. 200mg)</label>
                        <input type="text" name="strength" className="form-control" value={newMedicine.strength} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                        <label>Amount (tablets per dose)</label>
                        <input type="int" name="amount" placeholder="e.g.: 5" className="form-control" pattern="^(?:1[0-9]|2[0-3]|[0-9])$"  onChange={handleNumberChange}/>
                    </div>
                    <div className="mb-2">
                        <label>Time</label>
                        <div>
                            Hour
                            <input type="int" name = "hour" placeholder="e.g.: 23" className="form-control" pattern="^(?:1[0-9]|2[0-3]|[0-9])$" maxLength="2" onChange={handleNumberChange}/>
                        </div>
                        <div>
                            Minutes
                            <input type="int" name = "minute" placeholder="e.g.: 59" className="form-control" pattern="^(?:1[0-9]|2[0-3]|[0-9])$" maxLength="2" onChange={handleNumberChange}/>
                        </div>
                    </div>
                    <div className="mb-2">
                        <label>Start Date</label>
                        <input type="date" name="start_date" className="form-control" value={newMedicine.start_date} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                        <label>End Date</label>
                        <input type="date" name="end_date" className="form-control" value={newMedicine.end_date} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                        <label>Days of the Week</label>
                        <div className="d-flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <div key={day}>
                                    <input type="checkbox" name="days_of_week" value={day} onChange={handleFormChange} checked={newMedicine.days_of_week.includes(day)} /> {day}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-2">
                        <label>Notes</label>
                        <input type="text" name="notes" className="form-control" value={newMedicine.notes} onChange={handleFormChange} />
                    </div>
                    <div className="mb-2">
                        <label>Send Email Reminder?</label>
                        <input type="checkbox" name="send_email_reminder" checked={newMedicine.send_email_reminder} onChange={handleFormChange} />
                    </div>
                    <div className="mb-2">
                        <label>Reminder Before (minutes)</label>
                        <input type="number" name="reminder_minutes_before" className="form-control" value={newMedicine.reminder_minutes_before} onChange={handleFormChange} />
                    </div>
                    <button type="submit" className="btn btn-success">Save Medicine</button>
                </form>
            )}
        </div>
    );
};

export default SchedulePage;
