import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        setCurrentUser(null);
        navigate('/');
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}

export default Logout;
