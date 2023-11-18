import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import ReactMarkdown from "react-markdown";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

function GenerateDiet() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [preferences, setPreferences] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [goals, setGoals] = useState([]);
    const [diet, setDiet] = useState('');
    const [loading, setLoading] = useState(false);
    const [saveConfirmation, setSaveConfirmation] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
    const [allergiesModalOpen, setAllergiesModalOpen] = useState(false);
    const [goalsModalOpen, setGoalsModalOpen] = useState(false);

    const preferencesOptions = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Low Carb', 'None'];
    const allergiesOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'None'];
    const goalsOptions = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Weight Gain', 'None'];

    // Toggle function for preferences
    const handlePreferencesToggle = (item) => {
        if (item === 'None') {
            setPreferences(preferences.includes(item) ? [] : [item]);
        } else {
            setPreferences(prev => prev.includes('None') || prev.includes(item) ? prev.filter(p => p !== item && p !== 'None') : [...prev, item]);
        }
    };

    // Toggle function for allergies
    const handleAllergiesToggle = (item) => {
        if (item === 'None') {
            setAllergies(allergies.includes(item) ? [] : [item]);
        } else {
            setAllergies(prev => prev.includes('None') || prev.includes(item) ? prev.filter(a => a !== item && a !== 'None') : [...prev, item]);
        }
    };

    // Toggle function for goals
    const handleGoalsToggle = (item) => {
        if (item === 'None') {
            setGoals(goals.includes(item) ? [] : [item]);
        } else {
            setGoals(prev => prev.includes('None') || prev.includes(item) ? prev.filter(g => g !== item && g !== 'None') : [...prev, item]);
        }
    };

    const handleReturnToDashboard = () => {
        navigate('/diet-dashboard'); // Replace '/diet-dashboard' with your actual route
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

        // Validation
        if (preferences.length === 0 || allergies.length === 0 || goals.length === 0) {
            let message = '';
            if (preferences.length === 0) message += 'Select Dietary Preferences. ';
            if (allergies.length === 0) message += 'Select Allergies. ';
            if (goals.length === 0) message += 'Select Diet Goals.';
            setValidationMessage(message);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/generate-diet', { preferences, allergies, goals });
            setLoading(false);
            setDiet(response.data.diet);
            setValidationMessage('');
        } catch (error) {
            setLoading(false);
            console.error('Error generating diet:', error);
        }
    };

    const handleSaveDiet = async () => {
        if (!diet) {
            alert('No diet to save!');
            return;
        }
        const userEmail = currentUser.email;

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
        setSaveConfirmation(true);
        setTimeout(() => setSaveConfirmation(false), 3000);
    };


    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Generate Diet</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                {/* Button and Modal for Dietary Preferences */}
                <Button variant="outlined" onClick={() => setPreferencesModalOpen(true)} style={buttonStyle}>
                    Select Dietary Preferences
                </Button>
                <Modal open={preferencesModalOpen} onClose={() => setPreferencesModalOpen(false)}>
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                        {preferencesOptions.map(pref => (
                            <FormControlLabel
                                key={pref}
                                control={<Checkbox checked={preferences.includes(pref)} onChange={() => handlePreferencesToggle(pref)} />}
                                label={pref}
                            />
                        ))}
                        <Button onClick={() => setPreferencesModalOpen(false)}>Done</Button>
                    </Box>
                </Modal>
                {/* Display selected preferences */}
                <div>{preferences.join(', ')}</div>

                {/* Button and Modal for Allergies */}
                <Button variant="outlined" onClick={() => setAllergiesModalOpen(true)} style={buttonStyle}>
                    Select Allergies
                </Button>
                <Modal open={allergiesModalOpen} onClose={() => setAllergiesModalOpen(false)}>
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                        {allergiesOptions.map(allergy => (
                            <FormControlLabel
                                key={allergy}
                                control={<Checkbox checked={allergies.includes(allergy)} onChange={() => handleAllergiesToggle(allergy)} />}
                                label={allergy}
                            />
                        ))}
                        <Button onClick={() => setAllergiesModalOpen(false)}>Done</Button>
                    </Box>
                </Modal>
                {/* Display selected allergies */}
                <div>{allergies.join(', ')}</div>

                {/* Button and Modal for Diet Goals */}
                <Button variant="outlined" onClick={() => setGoalsModalOpen(true)} style={buttonStyle}>
                    Select Diet Goals
                </Button>
                <Modal open={goalsModalOpen} onClose={() => setGoalsModalOpen(false)}>
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                        {goalsOptions.map(goal => (
                            <FormControlLabel
                                key={goal}
                                control={<Checkbox checked={goals.includes(goal)} onChange={() => handleGoalsToggle(goal)} />}
                                label={goal}
                            />
                        ))}
                        <Button onClick={() => setGoalsModalOpen(false)}>Done</Button>
                    </Box>
                </Modal>
                {/* Display selected goal */}
                <div>{goals.join(', ')}</div>

                {/* Validation Message */}
                {validationMessage && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {validationMessage}
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && <CircularProgress style={{ marginBottom: 20 }} />}

                <Button style={buttonStyle} type="submit">Generate</Button>
            </form>

            {/* Display Diet Plan and Save Button */}
            {diet && (
                <>
                    <div style={{ width: '90%', maxWidth: '320px', textAlign: 'center' }}>
                        <h3>Your Diet Plan:</h3>
                        <ReactMarkdown>{diet}</ReactMarkdown>
                    </div>
                    <button onClick={handleSaveDiet} style={buttonStyle}>Save Diet Plan</button>
                </>
            )}

            {/* Button to navigate back to the diet dashboard */}
            <button onClick={handleReturnToDashboard} style={buttonStyle}>
                Back to Diet Dashboard
            </button>

            {/* Save Confirmation Popup */}
            {saveConfirmation && (
                <div style={{ position: 'absolute', bottom: '20px', backgroundColor: 'green', color: 'white', padding: '10px', borderRadius: '5px' }}>
                    Diet saved successfully!
                </div>
            )}
        </div>
    );
}
export default GenerateDiet;