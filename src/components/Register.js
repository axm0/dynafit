// Abdul Aziz Mohammed
import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const { setCurrentUser } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to '/register' with user registration data
            const response = await api.post('/register', { email, password, name });

            // Set the message received from the server
            setMessage(response.data.message);

            // If the server responds with "User registered successfully," set the current user
            if (response.data.message === "User registered successfully") {
                setCurrentUser({ email });
            }            
        } catch (error) {
            // Display a registration failure message
            setMessage("Failed to register. Try again.");
        }
    };

    const handleGoBackToLogin = () => {
        // Navigate back to the login page ('/')
        navigate('/');
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
            <button onClick={handleGoBackToLogin}>Go back to login</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;
