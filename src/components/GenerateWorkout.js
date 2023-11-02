import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function GenerateWorkout() {
    const { currentUser } = useAuth();
    const [duration, setDuration] = useState('');
    const [muscleGroups, setMuscleGroups] = useState('');
    const [equipment, setEquipment] = useState('');
    const [workout, setWorkout] = useState('');
    const navigate = useNavigate();

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

    const handleSaveWorkout = async () => {
        try {
            await api.post('/store-workout', { email: currentUser.email, workout: workout });
            fetchWorkouts();
            console.info('Workout saved successfully.');
        } catch (error) {
            console.error('Failed to save workout:', error);
        }
    };    

    useEffect(() => {
        fetchWorkouts();
    }, [currentUser.email]);

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
    
    const handleViewWorkouts = () => {
        navigate('/view-past-workouts');
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
                    <button onClick={handleSaveWorkout}>Save This Workout</button>
                </div>
            )}

            <button onClick={handleViewWorkouts}>
                View Past Workouts
            </button>
        </div>
    );
}

export default GenerateWorkout;