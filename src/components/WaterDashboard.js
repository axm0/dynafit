import React from 'react';
import { useNavigate } from 'react-router-dom';
//This is the basic dashboard for water tracking TC 10 Kay Lin
function WaterDashboard() {
    const navigate = useNavigate();
//This is the layout with the button
    return (
        <div>
            <h2>Water Dashboard</h2>
            <button onClick={() => navigate('/water-tracker')}>Add Current Water Consumption </button>
        </div>
    );
}

export default WaterDashboard;