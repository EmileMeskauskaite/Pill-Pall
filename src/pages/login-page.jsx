import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5169/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to login');
            }

            // Navigate to another page on successful login
            navigate('/dashboard');
        } catch (error) {
            console.error('Error during login:', error.message);
            alert(error.message);
        }
    };

    return (
        <div
            style={{ minHeight: '100vh', width: '100vw' }}
            className="d-flex justify-content-center align-items-center"
        >
            {/* Form container */}
            <div
                style={{ maxWidth: '420px', width: '100%', backgroundColor: 'white', position: 'relative' }}
                className="p-4 rounded shadow"
            >
                {/* Floating Back Button */}
                <button
                    className="btn-light"
                    onClick={() => window.history.back()}
                >
                    ← Back
                </button>

                <h2 className="text-center mb-4">Login</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100">Log in</button>
                </form>

                <p className="text-center mt-3">
                    Don't have an account?{' '}
                    <button className="btn btn-link p-0" onClick={() => navigate('/schedule')}>
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
