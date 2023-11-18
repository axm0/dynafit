//Grace Yang
import React from 'react';
import { useNavigate } from 'react-router-dom';

function DietDashboard() {
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
        fontSize: '24px',
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

    return (
        <div style={containerStyle}>
            <h1 style={headingStyle}>Diet Dashboard</h1>
            <div style={{ width: '100%' }}>
                <button onClick={() => navigate('/diet')} style={buttonStyle}>
                    Generate New Diet!
                </button>
            </div>
            <div style={{ width: '100%' }}>
                <button onClick={() => navigate('/view-saved-diets')} style={buttonStyle}>
                    View Saved Diets
                </button>
            </div>
        </div>
    );
}

export default DietDashboard;
