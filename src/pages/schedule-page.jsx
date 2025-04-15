import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SchedulePage = () => {
    const [schedule, setSchedule] = useState([]);
    const [user, setUser] = useState({ name: 'User', email: '', id: '' });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            const storedUser = userStr ? JSON.parse(userStr) : null;
            const token = localStorage.getItem('token');
            console.log(storedUser);
            if (storedUser && token) {
                setUser(storedUser);
                fetchSchedule(token, storedUser.id);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            navigate('/login');
        }
    }, []);

    const fetchSchedule = async (token,userid) => {
        try {
            
            const response = await fetch(`http://localhost:5169/${userid}/reminders`, {
                method: 'GET',
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
        function getThisWeekDates() {
            const today = new Date();
            const dayOfWeek = today.getDay();
            
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          
            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMonday);
            monday.setHours(0, 0, 0, 0); 
          
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999); 
          
            return {
              monday: monday,
              sunday: sunday
            };
        }
        console.log(getThisWeekDates())

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
                       const medsForDay = schedule.filter((med) => Array.isArray(med.days_of_week) && med.days_of_week.includes(day));

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

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Welcome, {user.name}</h2>
            <div className="d-flex justify-content-end mb-3 gap-2">
                <button onClick={handleLogOff} className="btn btn-danger">Log Off</button>
                <button onClick={() => navigate('/create-medicine')} className="btn btn-primary">Add Medicine</button>
            </div>

            <h3 className="text-center mb-4">Weekly Pill Calendar</h3>
            {renderWeeklyCalendar()}
        </div>
    );
};

export default SchedulePage;
