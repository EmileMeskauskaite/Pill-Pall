import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from '../components/forms/LoginForm';

const CaretakerLogin = () => {
  return (
    <LoginForm userType="caretaker"/>
  )
};

export default CaretakerLogin;
