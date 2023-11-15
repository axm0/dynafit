import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import ReactMarkdown from "react-markdown";

function GenerateDiet() {
    const { currentUser } = useAuth();
    const [preferences, setPreferences] = useState('');
    const [allergies, setAllergies] = useState('');
    const [goals, setGoals] = useState('');
    const [diet, setDiet] = useState('');
    const [loading, setLoading] = useState(false);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 'auto',
        paddingTop: '10vh',
        paddingBottom: '10vh', // Leave space for bottom navigation
        background: 'white',
        marginBottom: '60px', // Adjust this based on the height of your bottom navigation
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); // Set loading to true when the API call starts
            const response = await api.post('/generate-diet', { preferences, allergies, goals });
            setDiet(response.data.diet);
        } catch (error) {
            console.error('Error generating diet:', error);
        } finally {
            setLoading(false); // Set loading to false when the API call completes (regardless of success or failure)
        }
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
        <div style={containerStyle}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Generate Diet</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                <label style={{ display: 'block' }}>
                    Enter your dietary preferences:
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="e.g. vegetarian, vegan"
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                    />
                </label>
                <label style={{ display: 'block' }}>
                    Enter your allergies:
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="e.g. nuts, dairy"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                    />
                </label>
                <label style={{ display: 'block' }}>
                    Enter your diet goals:
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="e.g. weight loss, muscle gain"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                    />
                </label>
                <button style={buttonStyle} type="submit">Generate</button>
            </form>
            {loading && <p>Generating your diet...</p>}
            {diet && !loading && (
                <>
                    <div style={{ width: '90%', maxWidth: '320px', textAlign: 'center' }}>
                        <h3>Your Diet Plan:</h3>
                        <ReactMarkdown>{diet}</ReactMarkdown>
                    </div>
                    <button onClick={handleSaveDiet} style={buttonStyle}>Save Diet Plan</button>
                </>
            )}
        </div>
    );
}

export default GenerateDiet;
