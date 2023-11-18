// Minjae Chae
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";

function ViewPastWorkouts() {
    const { currentUser } = useAuth();
    const [pastWorkouts, setPastWorkouts] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Shared styles
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

    const workoutItemStyle = {
        background: '#f7f7f7',
        borderRadius: '15px',
        padding: '15px',
        margin: '10px 0',
        width: '90%',
        maxWidth: '320px',
    };

    const workoutContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center align items vertically
        width: '100%',
    };

    const handleDeleteWorkout = async (workoutId) => {
        try {
            // Send a DELETE request to '/delete-workout' to delete a specific workout
            await api.delete(`/delete-workout/${currentUser.email}/${workoutId}`);

            // Fetch the updated list of past workouts
            fetchWorkouts();

            console.info('Workout deleted successfully.');
        } catch (error) {
            console.error('Failed to delete workout:', error);
        }
    };

    const fetchWorkouts = async () => {
        if (!currentUser || !currentUser.email) {
            setError('Current user or user email is missing.');
            return;
        }

        try {
            // Send a GET request to '/fetch-workouts' to retrieve past workouts for the current user
            const response = await api.get(`/fetch-workouts/${currentUser.email}`);
            setPastWorkouts(response.data);
        } catch (err) {
            console.error('Failed to fetch workouts:', err);
            setError('Failed to fetch workouts. Please try again later.');
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, [currentUser.email]);

    const handleBack = () => {
        navigate('/workout-dashboard');
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Past Workouts</h1>
            {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
            {pastWorkouts && pastWorkouts.length > 0 ? (
                <div style={workoutContainerStyle}>
                    {pastWorkouts.map((workoutItem) => (
                        <div key={workoutItem.workoutId} style={workoutItemStyle}>
                            <ReactMarkdown>{workoutItem.workout}</ReactMarkdown>
                            <button onClick={() => handleDeleteWorkout(workoutItem.workoutId)} style={buttonStyle}>Delete</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No past workouts available.</p>
            )}
            <button onClick={handleBack} style={buttonStyle}>Back to Generate Workout</button>
        </div>
    );
}

export default ViewPastWorkouts;
