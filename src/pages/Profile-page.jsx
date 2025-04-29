import React, { useState } from 'react';
import Header from '../components/Header';
import SuccessNotification from '../components/notifications/SuccessNotification';
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
    let userData;
    let userType;
    const [successShow, setSuccessShow] = useState(false);
    const navigate = useNavigate();
    
    if (localStorage.getItem('caretaker')) {
        userData = JSON.parse(localStorage.getItem('caretaker'));
        userType = 'caretaker';
    } else {
        userData = JSON.parse(localStorage.getItem('user'));
        userType = 'users';
    }

    const [formData, setFormData] = useState({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
    });

    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        localStorage.setItem(userType, JSON.stringify({ ...userData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = userData.token;
        if (!token) {
            alert('Trūksta autentifikacijos rakto');
            return;
        }

        const endpoint =
            userType === 'caretaker'
                ? `http://localhost:5169/caretaker/${userData.id}`
                : `http://localhost:5169/user/${userData.id}`;

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error(`Nepavyko atnaujinti ${userType} profilio`);
            }
            handleSuccessNotification();
        } catch (error) {
            console.error(error);
            alert('Įvyko klaida atnaujinant profilį');
        }
    };
    const handleSuccessNotification = () => {
        setSuccessShow(true);
        setTimeout(() => setSuccessShow(false), 3100);
      };
    
    const handleDelete = async () => {
        const token = userData.token;
        if (!token) {
            alert('Trūksta autentifikacijos rakto');
            return;
        }

        const endpoint =
            userType === 'caretaker'
                ? `http://localhost:5169/caretaker/${userData.id}`
                : `http://localhost:5169/user/${userData.id}`;

        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Nepavyko ištrinti ${userType} profilio`);
            }
            localStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error(error);
            alert('Įvyko klaida ištrinant profilį');
        }
    };

    return (
        <>
            <Header />
            {successShow && <SuccessNotification />}
            <div
                className="d-flex justify-content-center align-items-start bg-light"
                style={{ minHeight: '100vh', paddingTop: '80px' }}
            >
                <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
                    <button
                        className="btn-light mb-2"
                        onClick={() => window.history.back()}
                    >
                        ← Grįžti
                    </button>
                    <h4 className="mb-4 text-center">Redaguoti mano profilį</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Vardas</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Pavardė</label>
                            <input
                                type="text"
                                name="surname"
                                className="form-control"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">El. paštas</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-success w-100 mb-2">
                            Pateikti
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={() => setShowModal(true)}
                        >
                            Ištrinti profilį
                        </button>
                    </form>
                </div>
            </div>

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
                    <div className="bg-white p-4 rounded shadow" style={{ width: '90%', maxWidth: '400px' }}>
                        <p className="mb-3">⚠️ Ar tikrai norite ištrinti savo profilį?</p>
                        <div className="d-flex justify-content-end">
                            <button
                                className="btn btn-danger me-2"
                                onClick={handleDelete}
                            >
                                Taip
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Atšaukti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;
