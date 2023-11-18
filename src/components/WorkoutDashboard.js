// Minjae Chae
import React from 'react';
import { useNavigate } from 'react-router-dom';

function WorkoutDashboard() {
    const navigate = useNavigate();

    // Define the same styling used in Login.js and Register.js
    const dashboardStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 'auto',
        paddingTop: '10vh',
        background: 'white'
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
        color: '#0d47a1', // Using the primary color defined in the theme
        margin: '20px 0'
    };

    return (
        <div style={dashboardStyle}>
            <h2 style={headingStyle}>Workout Dashboard</h2>
            <button onClick={() => navigate('/generate-workout')} style={buttonStyle}>Generate a Workout</button>
            <button onClick={() => navigate('/view-past-workouts')} style={buttonStyle}>View Saved Workouts</button>
        </div>
    );
}

export default WorkoutDashboard;

