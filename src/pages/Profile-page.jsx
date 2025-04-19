import React from 'react';
import Header from '../components/Header';
import { useState } from 'react';

const ProfilePage = () => {

    let userData;
    let userType;

    if (localStorage.getItem('caretaker')) {
        userData = JSON.parse(localStorage.getItem('caretaker'));
        userType = 'caretaker'
    }
    else {
        userData = JSON.parse(localStorage.getItem('user'));
        userType = 'users'
    }

    const [formData, setFormData] = useState({name: userData.name, surname: userData.surname, email: userData.email});
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        localStorage.setItem(userType, JSON.stringify(userData));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token is missing');
            return;
        }


        const endpoint = userType === 'caretaker' ? `http://localhost:5169/caretaker/${userData.id}` : `http://localhost:5169/user/${userData.id}`;
        try {
            console.log(endpoint);
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error(`Failed to update ${userType} profile`);
            }
            alert(`${userType.charAt(0).toUpperCase() + userType.slice(1)} profile updated successfully`);
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating the profile');
        }
    }

    return (
        <> <Header />
        <form onSubmit={handleSubmit}>
            <h4 className="mb-3">Edit my profile</h4>

            <div className="mb-2">
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-2">
                <label>Last Name</label>
                <input
                    type="text"
                    name="surname"
                    className="form-control"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-2">
                <label>Email</label>
                <input
                    type="text"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className="btn btn-success">Submit</button>
        </form>
    </>
    );
};

export default ProfilePage;
