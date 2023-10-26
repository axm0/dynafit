import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

function BottomNav() {
    const navigate = useNavigate();
    const [value, setValue] = React.useState('workout');

    const handleChange = (event, newValue) => {
        setValue(newValue);
        navigate('/' + newValue);
    };

    return (
        <BottomNavigation value={value} onChange={handleChange} showLabels>
            <BottomNavigationAction label="Workout" value="workout" icon={<FitnessCenterIcon />} />
            <BottomNavigationAction label="Diet" value="diet" icon={<RestaurantMenuIcon />} />
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
        </BottomNavigation>
    );
}

export default BottomNav;
