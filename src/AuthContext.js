// Abdul Aziz Mohammed
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Load user from local storage when component is mounted
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            if (userObj && userObj.email) {
                setCurrentUser(userObj);
            }
        }        
    }, []);

    const value = {
        currentUser,
        setCurrentUser: (user) => {
            setCurrentUser(user);

            // Save user to local storage
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                localStorage.removeItem('currentUser');
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
