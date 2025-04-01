import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchedulePage = () => {
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        // Fetch schedule data from API
        const fetchSchedule = async () => {
            try {
                const response = await axios.get('https://api.example.com/schedule'); // Replace with your API endpoint
                setSchedule(response.data);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            }
        };

        fetchSchedule();
    }, []);

    const renderSchedule = () => {
        return schedule.map((item, index) => (
            <div key={index} className="schedule-item">
                <span className="time">{item.time}</span>
                <span className="pill">{item.pill}</span>
                <span className="drug-info">{item.drugInfo}</span> {/* Assuming API provides drugInfo */}
            </div>
        ));
    };

    return (
        <div className="schedule-page">
            <h1>Pill Reminder Schedule</h1>
            <div className="schedule-list">{renderSchedule()}</div>
        </div>
    );
};

export default SchedulePage;