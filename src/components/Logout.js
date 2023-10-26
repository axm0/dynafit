import React from 'react';
import { useAuth } from '../AuthContext';

function Logout() {
    const { setCurrentUser } = useAuth();

    const handleLogout = () => {
        setCurrentUser(null);
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}

export default Logout;
