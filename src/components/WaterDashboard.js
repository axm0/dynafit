import React from 'react';
import { useNavigate } from 'react-router-dom';

function WaterDashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Water Dashboard</h2>
            <button onClick={() => navigate('/water-tracker')}>Add Current Water Consumption </button>
        </div>
    );
}

export default WaterDashboard;
