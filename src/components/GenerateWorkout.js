import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';  // Import useAuth
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function GenerateWorkout() {
    const { currentUser } = useAuth();  // Get currentUser from useAuth
    const [duration, setDuration] = useState('');
    const [muscleGroups, setMuscleGroups] = useState('');
    const [equipment, setEquipment] = useState('');
    const [workout, setWorkout] = useState('');
    const navigate = useNavigate();  // Initialize useNavigate

    console.log("currentUser:", currentUser);
    
    const fetchWorkouts = async () => {
        try {
            const response = await api.get(`/fetch-workouts/${currentUser.email}`);
            console.log(response.data);  // Log the response data
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
        }
    };

    useEffect(() => {
        fetchWorkouts();  // Fetch workouts when component mounts
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const muscleGroupsArray = muscleGroups.split(',').map(item => item.trim());
        const equipmentArray = equipment.split(',').map(item => item.trim());
        const response = await api.post('/generate-workout', { duration, muscleGroups: muscleGroupsArray, equipment: equipmentArray });
        setWorkout(response.data.workout);

        // Store the generated workout
        if (response && response.data && response.data.workout) {
            try {
                await api.post('/store-workout', { email: currentUser.email, workout: response.data.workout });
                fetchWorkouts();  // Fetch workouts again after storing the new workout
            } catch (error) {
                console.error('Failed to store workout:', error);
            }
        } else {
            console.error('Failed to generate workout:', response);
        }
    };    

    const handleViewWorkouts = () => {
        navigate('/view-past-workouts');  // Navigate to the View Past Workouts page
    }

    return (
        <div>
            <h2>Generate Workout</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Duration (e.g. 30 minutes)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Muscle Groups (e.g. arms, legs)"
                    value={muscleGroups}
                    onChange={(e) => setMuscleGroups(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Equipment (e.g. dumbbells)"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                />
                <button type="submit">Generate</button>
            </form>
            {workout && (
                <div>
                    <h3>Your Workout:</h3>
                    <p>{workout}</p>
                </div>
            )}
            <button onClick={handleViewWorkouts}>
                View Past Workouts
            </button>
        </div>
    );
}

export default GenerateWorkout;