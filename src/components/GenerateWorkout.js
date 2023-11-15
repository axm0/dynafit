// Abdul Aziz Mohammed
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function GenerateWorkout() {
    // Using hooks to manage component state and context
    const { currentUser } = useAuth();
    const [duration, setDuration] = useState('');
    const [muscleGroups, setMuscleGroups] = useState('');
    const [equipment, setEquipment] = useState('');
    const [workout, setWorkout] = useState('');
    const navigate = useNavigate();

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '90%',
        maxWidth: '320px',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid black',
        marginBottom: '20px',
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
    // Function to fetch the user's saved workouts
    const fetchWorkouts = async () => {
        if (!currentUser || !currentUser.email) {
            console.error('Current user or user email is missing.');
            return;
        }

        try {
            const response = await api.get(`/fetch-workouts/${currentUser.email}`);
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
        }
    };

    // Function to handle saving the generated workout
    const handleSaveWorkout = async () => {
        try {
            await api.post('/store-workout', { email: currentUser.email, workout: workout });
            fetchWorkouts();
            console.info('Workout saved successfully.');
        } catch (error) {
            console.error('Failed to save workout:', error);
        }
    };    

    // Use useEffect to fetch workouts when the component mounts or when currentUser.email changes
    useEffect(() => {
        fetchWorkouts();
    }, [currentUser.email]);

    // Function to handle form submission and generate a workout
    const handleSubmit = async (e) => {
        e.preventDefault();
        const muscleGroupsArray = muscleGroups.split(',').map(item => item.trim());
        const equipmentArray = equipment.split(',').map(item => item.trim());
        
        try {
            const response = await api.post('/generate-workout', { duration, muscleGroups: muscleGroupsArray, equipment: equipmentArray });
            
            if (response && response.data && response.data.workout) {
                setWorkout(response.data.workout);
            } else {
                console.error('Failed to generate workout:', response);
            }
        } catch (error) {
            console.error('Failed to generate workout:', error);
        }
    };
    
    // Function to handle navigation back to the workout dashboard
    const handleReturnToDashboard = () => {
        navigate('/workout-dashboard'); // Assuming '/workout' is the path for the workout dashboard
    };

    // Render the component's UI
    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: 36, fontWeight: '800', marginTop: '20px', marginBottom: '20px' }}>Generate Workout</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    style={inputStyle}
                    type="text"
                    placeholder="Duration (e.g. 30 minutes)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <input
                    style={inputStyle}
                    type="text"
                    placeholder="Muscle Groups (e.g. arms, legs)"
                    value={muscleGroups}
                    onChange={(e) => setMuscleGroups(e.target.value)}
                />
                <input
                    style={inputStyle}
                    type="text"
                    placeholder="Equipment (e.g. dumbbells)"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                />
                <button style={buttonStyle} type="submit">Generate</button>
            </form>
            {workout && (
                <div style={{ width: '90%', maxWidth: '320px', textAlign: 'center' }}>
                    <h3>Your Workout:</h3>
                    <p>{workout}</p>
                    <button onClick={handleSaveWorkout} style={buttonStyle}>Save This Workout</button>
                </div>
            )}
            <button onClick={handleReturnToDashboard} style={buttonStyle}>
                Return to Workout Dashboard
            </button>
        </div>
    );
}

export default GenerateWorkout;