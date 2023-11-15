
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom';

function ViewSavedDiets() {
    const [savedDiets, setSavedDiets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Shared styles
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

    const buttonStyle = {
        width: '90%',
        maxWidth: '320px',
        padding: '10px',
        borderRadius: '20px',
        background: '#0068FF',
        color: 'white',
        fontWeight: '800',
        fontSize: '18px',
        border: 'none',
        margin: '20px 0',
        cursor: 'pointer',
    };

    const listItemStyle = {
        background: '#f7f7f7',
        borderRadius: '15px',
        padding: '15px',
        margin: '10px 0',
        width: '90%',
        maxWidth: '320px',
    };

// Define fetchSavedDiets as a standalone function so it can be used in useEffect and handleDelete
const fetchSavedDiets = async () => {
    setIsLoading(true);
    if (!currentUser) {
        console.error('No current user found');
        setIsLoading(false);
        return;
    }
    try {
        const userEmail = currentUser.email;
        const response = await api.get(`/fetch-diets/${encodeURIComponent(userEmail)}`);
        const dietsData = response.data.map(diet => {
            return {
                dietID: diet.DietID,
                dietPlan: diet.dietPlan
            };
        });
        setSavedDiets(dietsData);
    } catch (error) {
        console.error('Failed to fetch diets:', error);
    }
    setIsLoading(false);
};

useEffect(() => {
    fetchSavedDiets();
}, [currentUser]); // This will call fetchSavedDiets when currentUser changes

    
    //sends back to diet dashboard 
    const handleBack = () => {
        navigate('/diet-dashboard');
    }; 

// Now handleDelete can call fetchSavedDiets since it's defined in the component scope
const handleDelete = async (dietID) => {
    if (!currentUser) {
        console.error('No current user found');
        return;
    }
    setIsLoading(true);
    try {
        await api.delete(`/delete-diet/${currentUser.email}/${dietID}`);
        await fetchSavedDiets(); // Re-fetch the diets to get the updated list
    } catch (error) {
        console.error('Failed to delete diet:', error);
    }
    setIsLoading(false);
};


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Saved Diets</h1>
            {savedDiets.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {savedDiets.map(diet => (
                        <li key={diet.dietID} style={listItemStyle}>
                            <div>
                                <h2>{diet.dietID}</h2>
                                <ReactMarkdown>{diet.dietPlan}</ReactMarkdown>
                                <button onClick={() => handleDelete(diet.dietID)} style={buttonStyle}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No saved diets found.</p>
            )}
            <button onClick={handleBack} style={buttonStyle}>Back to Diet Dashboard</button>
        </div>
    );
}

export default ViewSavedDiets;
