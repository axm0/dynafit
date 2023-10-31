import React, { useState } from 'react';
import api from '../services/api';

function GenerateWorkout() {
    const [duration, setDuration] = useState('');
    const [muscleGroups, setMuscleGroups] = useState('');
    const [equipment, setEquipment] = useState('');
    const [workout, setWorkout] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const muscleGroupsArray = muscleGroups.split(',').map(item => item.trim());
        const equipmentArray = equipment.split(',').map(item => item.trim());
        console.log({ duration, muscleGroups: muscleGroupsArray, equipment: equipmentArray });
        const response = await api.post('/generate-workout', { duration, muscleGroups: muscleGroupsArray, equipment: equipmentArray });
        setWorkout(response.data.workout);
    };    

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
            {workout && <div><h3>Your Workout:</h3><p>{workout}</p></div>}
        </div>
    );
}

export default GenerateWorkout;
