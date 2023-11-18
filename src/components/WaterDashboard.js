import React from 'react';
import { useNavigate } from 'react-router-dom';
//This is the basic dashboard for water tracking TC 10 Kay Lin
function WaterDashboard() {
    const navigate = useNavigate();

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 'auto',
        paddingTop: '10vh',
        paddingBottom: '10vh',
        background: 'white',
        marginBottom: '60px',
    };

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

    const headingStyle = {
        fontSize: '36px',
        fontWeight: '800',
        color: '#0d47a1',
        marginBottom: '20px',
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