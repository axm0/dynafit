import React from 'react';
import { useNavigate } from 'react-router-dom';
//This is the basic dashboard for water tracking TC 10 Kay Lin
function WaterDashboard() {
    const navigate = useNavigate();

    const buttonStyle = {
        width: '90%',
        padding: '10px',
        borderRadius: '20px',
        background: '#0068FF',
        color: 'white',
        fontWeight: '800',
        fontSize: '22px',
        border: 'none',
        marginBottom: '20px',
        cursor: 'pointer',
        maxWidth: '320px',
    };


//This is the layout with the button
    return (
        <div>
            <h2>Water Dashboard</h2>
            <button style={buttonStyle} onClick={() => navigate('/water-tracker')}>Add Current Water Consumption </button>
        </div>
    );
}

export default WaterDashboard;