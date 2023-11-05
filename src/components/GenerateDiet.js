import React, { useState, useContext } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import ReactMarkdown from "react-markdown";

//Grace -- Testcase 20 Generate Diet and Testcase 31 Save Diet and Testcase 7 Access Generate Diet Page
function GenerateDiet() {
    //define 
    const { currentUser } = useAuth();
    const [preferences, setPreferences] = useState('');
    const [allergies, setAllergies] = useState('');
    const [goals, setGoals] = useState('');
    const [diet, setDiet] = useState('');

    //code to handle when user clicks generate diet
    const handleSubmit = async (e) => {
        e.preventDefault();
        //wait for response from API
        const response = await api.post('/generate-diet', { preferences, allergies, goals });
        setDiet(response.data.diet);
    };

    //code to handle when user clicks save diet 
    const handleSaveDiet = async () => {
        if (!diet) {
            alert('No diet to save!');
            return;
        }
        const userEmail = currentUser.email;
    
        //sends to database and saves
        await api.post('/store-diet', {
            email: userEmail,
            dietPlan: diet
        })
        .then(() => {
            alert('Diet saved successfully!');
        })
        .catch((error) => {
            console.error('Error saving the diet:', error);
            alert('Failed to save diet. Please try again.');
        });
    };
    
    

    //generate diet front end
    return (
        <div>
            <h2>Generate Diet</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'block', margin: '4em 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your dietary preferences:
                    </label>
                        <input
                            type="text"
                            placeholder="e.g. vegetarian, vegan"
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                        />
                </div>
                <div style={{ display: 'block', margin: '4em 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your allergies:
                    </label>
                        <input
                            type="text"
                            placeholder="e.g. nuts, dairy"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                        />
                </div>
                <div style={{ display: 'block', margin: '4em 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your diet goals:
                    </label>
                        <input
                            type="text"
                            placeholder="e.g. weight loss, muscle gain"
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                        />
                </div>
                <div style={{ display: 'block', margin: '4em 0' }}>
                    <button type="submit">Generate</button>
                </div>
            </form>
            {diet && (
                <>
                    <div><h3>Your Diet Plan:</h3><ReactMarkdown>{diet}</ReactMarkdown></div>
                    <button onClick={handleSaveDiet}>Save Diet Plan</button>
                </>
            )}
        </div>
    );
}

export default GenerateDiet;