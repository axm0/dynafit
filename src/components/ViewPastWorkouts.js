import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function ViewPastWorkouts() {
    const { currentUser } = useAuth();
    const [pastWorkouts, setPastWorkouts] = useState([]);
    const navigate = useNavigate();

    console.log("currentUser:", currentUser);

    const fetchWorkouts = async () => {
        try {
            const response = await api.get(`/fetch-workouts/${currentUser.email}`);
            setPastWorkouts(response.data);
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleBack = () => {
        navigate('/workout');
    };

    return (
        <div>
            <h2>Past Workouts</h2>
            {pastWorkouts && pastWorkouts.length > 0 && (
                <div>
                    {pastWorkouts.map((workoutItem, index) => (
                        <div key={index}>
                            <p>{workoutItem.workout}</p>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={handleBack}>Back to Generate Workout</button>
        </div>
    );
}

export default ViewPastWorkouts;