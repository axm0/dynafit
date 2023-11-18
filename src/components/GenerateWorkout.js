// Abdul Aziz Mohammed
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import Slider from '@mui/material/Slider';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';

function GenerateWorkout() {
    const { currentUser } = useAuth();
    const [duration, setDuration] = useState(30);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [workout, setWorkout] = useState('');
    const [loading, setLoading] = useState(false);
    const [muscleGroupModalOpen, setMuscleGroupModalOpen] = useState(false);
    const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
    const navigate = useNavigate();
    const [saveConfirmation, setSaveConfirmation] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

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
    
    const muscleGroupOptions = ['Arms', 'Legs', 'Back', 'Chest', 'Shoulders', 'Core'];
    const equipmentOptions = ['Dumbbells', 'Barbell', 'Kettlebells', 'Bands', 'No Equipment'];

    const handleMuscleGroupToggle = (group) => {
        setMuscleGroups(prev => prev.includes(group) ? prev.filter(item => item !== group) : [...prev, group]);
    };

    const handleEquipmentToggle = (item) => {
        if (item === 'No Equipment') {
            if (equipment.includes(item)) {
                setEquipment(prev => prev.filter(equip => equip !== item));
            } else {
                setEquipment([item]);
            }
        } else {
            if (equipment.includes('No Equipment')) {
                setEquipment([item]);
            } else {
                setEquipment(prev => prev.includes(item) ? prev.filter(equip => equip !== item) : [...prev, item]);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if muscle groups or equipment are selected
        if (muscleGroups.length === 0 || equipment.length === 0) {
            let message = '';
            if (muscleGroups.length === 0) {
                message += 'Select Muscle Groups';
            }
            if (equipment.length === 0) {
                message += message.length > 0 ? ' and Equipment' : 'Select Equipment';
            }
            setValidationMessage(message);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/generate-workout', { duration, muscleGroups, equipment });
            setLoading(false);
            setWorkout(response.data.workout);
            setValidationMessage(''); // Clear validation message
        } catch (error) {
            setLoading(false);
            console.error('Failed to generate workout:', error);
        }
    };

    // Function to fetch the user's saved workouts
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

    // Function to handle saving the generated workout
    const handleSaveWorkout = async () => {
        try {
            await api.post('/store-workout', { email: currentUser.email, workout: workout });
            fetchWorkouts();
            console.info('Workout saved successfully.');
            setSaveConfirmation(true); // Set confirmation state to true
            setTimeout(() => setSaveConfirmation(false), 3000); // Reset after 3 seconds
        } catch (error) {
            console.error('Failed to save workout:', error);
        }
    };    

    // Use useEffect to fetch workouts when the component mounts or when currentUser.email changes
    useEffect(() => {
        fetchWorkouts();
    }, [currentUser.email]);

    // Define function to toggle muscle group selection
    const toggleMuscleGroup = (group) => {
        setMuscleGroups(prev => prev.includes(group) ? prev.filter(item => item !== group) : [...prev, group]);
    };

    // Define function to toggle equipment selection
    const toggleEquipment = (item) => {
        setEquipment(prev => prev.includes(item) ? prev.filter(equip => equip !== item) : [...prev, item]);
    };

    // Function to handle navigation back to the workout dashboard
    const handleReturnToDashboard = () => {
        navigate('/workout-dashboard');
    };

    function ValueLabelComponent(props) {
        const { children, open, value } = props;

        return (
            <Tooltip open={open} enterTouchDelay={0} placement="bottom" title={value}>
                {children}
            </Tooltip>
        );
    }

    // Render the component's UI
    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                {/* Workout Duration Slider */}
                <div style={{ marginBottom: 30 }}>
                    <strong>Select Workout Duration</strong>
                </div>
                <Slider
                    value={duration}
                    onChange={(e, newValue) => setDuration(newValue)}
                    valueLabelDisplay="on"
                    min={1}
                    max={120}
                    style={{ marginBottom: 20, width: '90%' }}
                />

                {/* Muscle Group Selection */}
                <Button onClick={() => setMuscleGroupModalOpen(true)} style={buttonStyle}>
                    Select Muscle Groups
                </Button>
                {/* Display selected muscle groups */}
                <div style={{ marginBottom: 10 }}>{muscleGroups.join(', ')}</div>

                {/* Equipment Selection */}
                <Button onClick={() => setEquipmentModalOpen(true)} style={buttonStyle}>
                    Select Equipment
                </Button>
                {/* Display selected equipment */}
                <div style={{ marginBottom: 10 }}>{equipment.join(', ')}</div>
  
                {/* Validation Message */}
                {validationMessage && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {validationMessage}
                    </div>
                )}

                {/* Submit Button */}
                <Button type="submit" style={buttonStyle}>
                    Generate
                </Button>
            </form>

            <Modal open={muscleGroupModalOpen} onClose={() => setMuscleGroupModalOpen(false)}>
                <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                    {muscleGroupOptions.map(group => (
                        <FormControlLabel
                            key={group}
                            control={<Checkbox checked={muscleGroups.includes(group)} onChange={() => handleMuscleGroupToggle(group)} />}
                            label={group}
                        />
                    ))}
                    <Button onClick={() => setMuscleGroupModalOpen(false)}>Done</Button>
                </Box>
            </Modal>

            <Modal open={equipmentModalOpen} onClose={() => setEquipmentModalOpen(false)}>
                <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20 }}>
                    {equipmentOptions.map(item => (
                        <FormControlLabel
                            key={item}
                            control={<Checkbox checked={equipment.includes(item)} onChange={() => handleEquipmentToggle(item)} />}
                            label={item}
                        />
                    ))}
                    <Button onClick={() => setEquipmentModalOpen(false)}>Done</Button>
                </Box>
            </Modal>

            {loading && <CircularProgress style={{ marginTop: 20 }} />}

            {/* Display Generated Workout and Save Button */}
            {workout && (
                <div style={{ marginTop: 20 }}>
                    <h3>Your Workout:</h3>
                    <ReactMarkdown>{workout}</ReactMarkdown>
                    <button onClick={handleSaveWorkout} style={buttonStyle}>Save This Workout</button>
                </div>
            )}

            {/* Navigation Back to Dashboard */}
            <button onClick={handleReturnToDashboard} style={buttonStyle}>
                Return to Workout Dashboard
            </button>

            {/* Save Confirmation Popup */}
            {saveConfirmation && (
                <div style={{ position: 'absolute', bottom: '20px', backgroundColor: 'green', color: 'white', padding: '10px', borderRadius: '5px' }}>
                    Workout saved successfully!
                </div>
            )}
        </div>
    );
}


export default GenerateWorkout;