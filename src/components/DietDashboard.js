import React from 'react';
import { useNavigate } from 'react-router-dom';

function DietDashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Diet Dashboard</h2>
            <button onClick={() => navigate('/view-saved-diets')}>View Saved Diets</button>
            <button onClick={() => navigate('/diet')}>Generate New Diet</button>
        </div>
    );
}

export default DietDashboard;
