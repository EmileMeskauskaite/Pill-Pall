import React, { useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import pillImage from '../assets/Pill_image.png';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {

    useEffect(()=>{
    localStorage.clear();
    },[])

    const navigate = useNavigate();

    return (
        <div className="index-background">
            <img className="main-page-image" src={pillImage} alt="Background Image" />
            <div className="card-container-right">
                <div className="card card-right">
                    <h1>Welcome to Pill Pal</h1>
                    <p>Your ultimate medicine reminder app. Stay on top of your health with ease!</p>
                    <div>
                        <button className="btn btn-green" onClick={() => navigate('/register')}>Register</button>
                        <button className="btn btn-primary" onClick={()=> navigate('/login')}>Log In</button>
                        <button className="btn btn-warning" onClick={()=> navigate('/caretaker-login')}>Caretaker</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
