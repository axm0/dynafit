import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function BottomNav() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [value, setValue] = React.useState('workout');

    const handleChange = (event, newValue) => {
        setValue(newValue);
        switch (newValue) {
            case "logout":
                setCurrentUser(null);
                navigate("/");
                break;
            case "diet":
                navigate("/diet-dashboard");
                break;
            default:
                navigate('/' + newValue);
                break;
        }
    };
    

    return (
        <BottomNavigation value={value} onChange={handleChange} showLabels>
            <BottomNavigationAction label="Workout" value="workout-dashboard" icon={<FitnessCenterIcon />} />
            <BottomNavigationAction label="Diet" value="diet-dashboard" icon={<RestaurantMenuIcon />} />
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
            <BottomNavigationAction label="Logout" value="logout" icon={<LogoutIcon />} /> 
        </BottomNavigation>
    );
}

export default BottomNav;