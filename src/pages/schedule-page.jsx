import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Calendar from "../components/Calendar";

const SchedulePage = () => {
  const [user, setUser] = useState({ name: "User", email: "", id: "" });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const storedUser = userStr ? JSON.parse(userStr) : null;
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        setUser(storedUser);
        // fetchSchedule(token);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Header />
      <h1 className="text-center">Welcome, {user.name}</h1>
      <div className="container py-4">
        <h2 className="text-center mb-4">
        </h2>
        <Calendar />
        <h3 className="text-center mb-4">Weekly Pill Calendar</h3>
      </div>
    </>
  );
};

export default SchedulePage;
