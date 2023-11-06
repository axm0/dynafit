// Minjae Chae
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function ViewPastWorkouts() {
    const { currentUser } = useAuth();
    const [pastWorkouts, setPastWorkouts] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        // Fetch past workouts when the component mounts or when the current user's email changes
        fetchWorkouts();
    }, [currentUser.email]);

    const handleBack = () => {
        // Navigate back to the workout dashboard
        navigate('/workout-dashboard');
    };    

    return (
        <div>
            <h2>Past Workouts</h2>
            {error && <p className="error">{error}</p>}
            {pastWorkouts && pastWorkouts.length > 0 ? (
                <div>
                    {pastWorkouts.map((workoutItem) => (
                        <div key={workoutItem.workoutId}>
                            <p><strong>Workout:</strong> {workoutItem.workout}</p>
                            <button onClick={() => handleDeleteWorkout(workoutItem.workoutId)}>Delete</button>
                            <hr />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No past workouts available.</p>
            )}
            <button onClick={handleBack}>Back to Generate Workout</button>
        </div>
    );
}

export default ViewPastWorkouts;
