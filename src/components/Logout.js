// Abdul Aziz Mohammed
import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Call setCurrentUser with null to log the user out
        setCurrentUser(null);

        // Navigate to the home page ('/')
        navigate('/');
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}

export default Logout;

