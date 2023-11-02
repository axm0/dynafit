import React from 'react';
import { useNavigate } from 'react-router-dom';

function WorkoutDashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Workout Dashboard</h2>
            <button onClick={() => navigate('/generate-workout')}>Generate a Workout</button>
            <button onClick={() => navigate('/view-past-workouts')}>View Saved Workouts</button>
        </div>
    );
}

export default WorkoutDashboard;
