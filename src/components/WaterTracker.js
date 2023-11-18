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


//Here is where we find our water goals and tracking TC 8 TC 9 Kay Lin
function WaterTracker() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [amountOfWater, setamountOfWater] = useState([]);
    const [unitOfWater, setunitOfWater] = useState([]);
    const [water, setWater] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [amountOfWaterModalOpen, setamountOfWaterModalOpen] = useState(false);
    const [unitOfWaterModalOpen, setunitOfWaterModalOpen] = useState(false);

    const amountOfWaterOptions = ['1', '2', '3', '4', '5' , '6' , '7' , '8', '9' , '10'];
    const unitOfWaterOptions = ['cups', 'gallons', 'ounces', 'pints', 'liters', 'milliliters'];

//Toggle function for amount of water
    const handleamountOfWaterToggle = (item) => {
        if (item === 'None') {
            setamountOfWater(amountOfWater.includes(item) ? [] : [item]);
        } else {
            setamountOfWater(prev => prev.includes('None') || prev.includes(item) ? prev.filter(p => p !== item && p !== 'None') : [...prev, item]);
        }
    };

    // Toggle function for unit of water
    const handleunitOfWaterToggle = (item) => {
        if (item === 'None') {
            setunitOfWater(unitOfWater.includes(item) ? [] : [item]);
        } else {
            setunitOfWater(prev => prev.includes('None') || prev.includes(item) ? prev.filter(a => a !== item && a !== 'None') : [...prev, item]);
        }
    };

    const handleReturnToDashboard = () => {
        navigate('/water-dashboard');
    };

    //Design for the page
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
        fontSize: '22px',
        border: 'none',
        marginBottom: '20px',
        cursor: 'pointer',
        maxWidth: '320px',
    };

    const genButtonStyle = {
        width: '90%',
        padding: '10px',
        borderRadius: '20px',
        background: '#44546c',
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
        if (unitOfWater.length === 0 || amountOfWater.length === 0) {
            let message = '';
            if (amountOfWater.length === 0) message += 'Select amount of water. ';
            if (unitOfWater.length === 0) message += 'Select unit of water. ';
            setValidationMessage(message);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/generate-water', { amountOfWater, unitOfWater });
            setLoading(false);
            setWater(response.data.water);
            setValidationMessage('');
        } catch (error) {
            setLoading(false);
            console.error('Error generating water goals:', error);
        }
    };



    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Generate Water Goals</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                {/* Button and Modal for Water Preferences */}
                <Button variant="outlined" onClick={() => setamountOfWaterModalOpen(true)} style={buttonStyle}>
                    Select Amount of Water Drank
                </Button>
                <Modal open={amountOfWaterModalOpen} onClose={() => setamountOfWaterModalOpen(false)}>
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                        {amountOfWaterOptions.map(amountOfW => (
                            <FormControlLabel
                                key={amountOfW}
                                control={<Checkbox checked={amountOfWater.includes(amountOfW)} onChange={() => handleamountOfWaterToggle(amountOfW)} />}
                                label={amountOfW}
                            />
                        ))}
                        <Button onClick={() => setamountOfWaterModalOpen(false)}>Done</Button>
                    </Box>
                </Modal>
                {/* Display selected preferences */}
                <div>{amountOfWater.join(', ')}</div>

                <Button variant="outlined" onClick={() => setunitOfWaterModalOpen(true)} style={buttonStyle}>
                    Select Unit of Water Drank
                </Button>
                <Modal open={unitOfWaterModalOpen} onClose={() => setunitOfWaterModalOpen(false)}>
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                        {unitOfWaterOptions.map(unitOfW => (
                            <FormControlLabel
                                key={unitOfW}
                                control={<Checkbox checked={unitOfWater.includes(unitOfW)} onChange={() => handleunitOfWaterToggle(unitOfW)} />}
                                label={unitOfW}
                            />
                        ))}
                        <Button onClick={() => setunitOfWaterModalOpen(false)}>Done</Button>
                    </Box>
                </Modal>
                {/* Display selected preferences */}
                <div>{unitOfWater.join(', ')}</div>

             

                {/* Validation Message */}
                {validationMessage && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {validationMessage}
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && <CircularProgress style={{ marginBottom: 20 }} />}

                <Button style={genButtonStyle} type="submit">Generate</Button>
            </form>

            {/* Display Water goals */}
            {water && (
                <>
                    <div style={{ width: '90%', maxWidth: '320px', textAlign: 'center' }}>
                        <h3>Your Water Goals:</h3>
                        <ReactMarkdown>{water}</ReactMarkdown>
                    </div>
                </>
            )}

            {/* Button to navigate back to the water dashboard */}
            <button onClick={handleReturnToDashboard} style={buttonStyle}>
                Return to Water Dashboard
            </button>
        </div>
    );

}

export default WaterTracker;