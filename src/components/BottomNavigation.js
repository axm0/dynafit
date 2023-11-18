import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import OpacityIcon from '@mui/icons-material/Opacity';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function BottomNav() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [value, setValue] = useState('workout-dashboard');

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (newValue === "logout") {
            setCurrentUser(null);
            navigate("/");
        } else {
            navigate(`/${newValue}`);
        }
    };

    const bottomNavStyle = {
        width: '100%',
        position: 'fixed',
        bottom: 0,
        boxShadow: '0 -1px 10px -5px rgba(0, 0, 0, 0.2)',
        borderRadius: '20px 20px 0 0',
        background: '#0068FF',
        color: 'white',
        zIndex: 1000,
    };

    const bottomNavActionStyle = {
        color: 'white',
        padding: '10px',
        minWidth: 'auto',
    };

    return (
        <BottomNavigation style={bottomNavStyle} value={value} onChange={handleChange}>
            <BottomNavigationAction label="Workout" value="workout-dashboard" icon={<FitnessCenterIcon />} style={bottomNavActionStyle} />
            <BottomNavigationAction label="Diet" value="diet-dashboard" icon={<RestaurantMenuIcon />} style={bottomNavActionStyle} />
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} style={bottomNavActionStyle} />
            <BottomNavigationAction label="Water Goals" value="water-dashboard" icon={<OpacityIcon />} style={bottomNavActionStyle} />
            <BottomNavigationAction label="Logout" value="logout" icon={<LogoutIcon />} style={bottomNavActionStyle} />
        </BottomNavigation>
    );
}

export default BottomNav;
