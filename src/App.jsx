import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/main-page';
import RegisterPage from './pages/register-page';
import LoginPage from './pages/login-page';
import SchedulePage from './pages/schedule-page';


function App() {
    return (
        <Router>
            <Routes>

                <Route path="/" element={<MainPage />} /> 
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
               
            </Routes>
        </Router>
    );
}

export default App;
