import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import pillImage from '../assets/Pill_image.png';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="index-background">
            <img className="main-page-image" src={pillImage} alt="Fono paveikslėlis" />
            <div className="card-container-right">
                <div className="card card-right">
                    <h1>Sveiki atvykę į Vaistūną</h1>
                    <p>Vaistūnas - jūsų patikima vaistų priminimų programa. Lengvai rūpinkitės savo sveikata!</p>
                    <div>
                        <button
                            className="btn btn-green"
                            onClick={() => navigate('/register')}
                        >
                            Registruotis
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Prisijungti
                        </button>
                        <button
                            className="btn btn-warning"
                            onClick={() => navigate('/caretaker-login')}
                        >
                            Prižiūrėtojas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
