import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateMedicinePage = () => {
    const navigate = useNavigate();
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

    const [pillAmount, setPillAmount] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const daysOfWeek = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis'];

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

    const handleNumberChange = (e) => {
        const { value, name } = e.target; 

        if (/^\d*$/.test(value)) {
            if (name === 'hour' && (value === '' || parseInt(value) <= 23)) {
                setHours(value);
            } else if (name === 'minute' && (value === '' || parseInt(value) <= 59)) {
                setMinutes(value);
            } else if (name === 'amount') {
                setPillAmount(value);
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const finalTimesPerDay = [`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`];
        const finalMedicine = {
            ...newMedicine,
            amount: parseInt(pillAmount),
            times_per_day: finalTimesPerDay
        };

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5169/medicines/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(finalMedicine),
            });

            if (response.ok) {
                navigate('/');
            } else {
                console.error('Nepavyko sukurti vaisto');
            }
        } catch (err) {
            console.error('Klaida:', err);
        }
    };

    return (
        <div className="container py-4">
            <h3 className="mb-4">Pridėti naują vaistą</h3>
            <form onSubmit={handleFormSubmit} className="border p-3 rounded bg-light">
                <div className="mb-2">
                    <label>Vaisto pavadinimas</label>
                    <input type="text" name="medicine_name" className="form-control" value={newMedicine.medicine_name} onChange={handleFormChange} required />
                </div>
                <div className="mb-2">
                    <label>Stiprumas (pvz. 200mg)</label>
                    <input type="text" name="strength" className="form-control" value={newMedicine.strength} onChange={handleFormChange} required />
                </div>
                <div className="mb-2">
                    <label>Kiekis (tabletės vienai dozei)</label>
                    <input type="int" name="amount" className="form-control" onChange={handleNumberChange} />
                </div>
                <div className="mb-2">
                    <label>Laikas</label>
                    <input type="int" name="hour" placeholder="Valanda (0-23)" className="form-control" maxLength="2" onChange={handleNumberChange} />
                    <input type="int" name="minute" placeholder="Minutės (0-59)" className="form-control mt-1" maxLength="2" onChange={handleNumberChange} />
                </div>
                <div className="mb-2">
                    <label>Pradžios data</label>
                    <input type="date" name="start_date" className="form-control" value={newMedicine.start_date} onChange={handleFormChange} required />
                </div>
                <div className="mb-2">
                    <label>Pabaigos data</label>
                    <input type="date" name="end_date" className="form-control" value={newMedicine.end_date} onChange={handleFormChange} required />
                </div>
                <div className="mb-2">
                    <label>Savaitės dienos</label>
                    <div className="d-flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <div key={day}>
                                <input type="checkbox" name="days_of_week" value={day} onChange={handleFormChange} checked={newMedicine.days_of_week.includes(day)} /> {day}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-2">
                    <label>Pastabos</label>
                    <input type="text" name="notes" className="form-control" value={newMedicine.notes} onChange={handleFormChange} />
                </div>
                <div className="mb-2">
                    <label>Siųsti el. paštu priminimą?</label>
                    <input type="checkbox" name="send_email_reminder" checked={newMedicine.send_email_reminder} onChange={handleFormChange} />
                </div>
                <div className="mb-2">
                    <label>Priminti prieš (minutėmis)</label>
                    <input type="number" name="reminder_minutes_before" className="form-control" value={newMedicine.reminder_minutes_before} onChange={handleFormChange} />
                </div>
                <button type="submit" className="btn btn-success mt-2">Išsaugoti vaistą</button>
            </form>
        </div>
    );
};

export default CreateMedicinePage;
