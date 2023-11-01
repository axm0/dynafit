import React, { useState } from 'react';
import api from '../services/api';

function GenerateDiet() {
    const [preferences, setPreferences] = useState('');
    const [allergies, setAllergies] = useState('');
    const [goals, setGoals] = useState('');
    const [diet, setDiet] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await api.post('/generate-diet', { preferences, allergies, goals });
        setDiet(response.data.diet);
    };

    return (
        <div>
            <h2>Generate Diet</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Dietary Preferences (e.g. vegetarian, vegan)"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Allergies (e.g. nuts, dairy)"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Goals (e.g. weight loss, muscle gain)"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                />
                <button type="submit">Generate</button>
            </form>
            {diet && <div><h3>Your Diet Plan:</h3><p>{diet}</p></div>}
        </div>
    );
}

export default GenerateDiet;