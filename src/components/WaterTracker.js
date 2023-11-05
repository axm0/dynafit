import React, { useState, useContext } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';

function WaterTracker() {
    const { currentUser } = useAuth();
    const [amountOfWater, setamountOfWater] = useState('');
    const [unitOfWater, setunitOfWater] = useState('');
    const [water, setWater] = useState('');

    const handleSubmit = async (z) => {
        z.preventDefault();
        const response = await api.post('/generate-water', { amountOfWater, unitOfWater });
        setWater(response.data.water);
    };
    
    const handleSaveDiet = async () => {
        if (!water) {
            alert('No water to save!');
            return;
        }
        const userEmail = currentUser.email;
    
        await api.post('/store-water', {
            email: userEmail,
            waterPlan: water
        })
        .then(() => {
            alert('water saved successfully!');
        })
        .catch((error) => {
            console.error('Error saving the water:', error);
            alert('Failed to save water. Please try again.');
        });
    };
    

    return (
        <div>
            <h2>Generate Water</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'block', margin: '10px 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your How Much Water You Have Drunk:
                    </label>
                        <input
                            type="text"
                            placeholder="e.g. 1 , 2, 4"
                            value={amountOfWater}
                            onChange={(z) => setamountOfWater(z.target.value)}
                        />
                </div>
                <div style={{ display: 'block', margin: '10px 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your units of water:
                    </label>
                        <input
                            type="text"
                            placeholder="e.g. cups, gallons"
                            value={unitOfWater}
                            onChange={(z) => setunitOfWater(z.target.value)}
                        />
                </div>
                <div style={{ display: 'block', margin: '10px 0' }}>
                    <button type="submit">Generate</button>
                </div>
            </form>
            {water && (
                <>
                    <div><h3>Your Water Goals:</h3>
                    <p>{water}</p></div>
                    
                </>
            )}
        </div>
    );
}

export default WaterTracker;