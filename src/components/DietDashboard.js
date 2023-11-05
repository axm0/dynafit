import React from 'react';
import { useNavigate } from 'react-router-dom';

//Grace Testcase 7 Access Generate Diet Page and View Saved Diets
function DietDashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Diet Dashboard</h2>
            <div style={{margin: '13em 0'}}>
                <button onClick={() => navigate('/diet')}>Generate New Diet!</button>
            </div>
            <div style={{margin: '14em 0'}}>
                <button onClick={() => navigate('/view-saved-diets')}>View Saved Diets</button>
            </div>
        </div>
    );
}

export default DietDashboard;
