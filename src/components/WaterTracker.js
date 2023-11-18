import React, { useState, useContext } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';

//Here is where we find our water goals and tracking TC 8 TC 9 Kay Lin
function WaterTracker() {
    const { currentUser } = useAuth();
    const [amountOfWater, setamountOfWater] = useState('');
    const [unitOfWater, setunitOfWater] = useState('');
    const [water, setWater] = useState('');

    //This waits for a response to send to the api and then send it
    const handleSubmit = async (z) => {
        z.preventDefault();
        const response = await api.post('/generate-water', { amountOfWater, unitOfWater });
        setWater(response.data.water);
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
    
//Here is the layout for the page. We have how much they have drunk, units of water for measurement, and a generate at the end
    return ( 
        <div>
            <h2>Generate Water</h2>
            <form onSubmit={handleSubmit}>
                
                <div style={{ display: 'block', margin: '10px 0' }}>
                    <label style={{ display: 'block' }}>
                        Enter your How Much Water You Have Drank:
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
                    <button style={buttonStyle} type="submit">Generate</button>
                </div>
            </form>
            {water && (
                <>
                    <div><h3>Your Water Goals:</h3><p>{water}</p></div>
                    
                </>
            )}
        </div>
    );
}

export default WaterTracker;