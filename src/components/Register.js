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
            const response = await api.post('/register', { email, password, name });
            setMessage(response.data.message);
            if (response.data.message === "User registered successfully") {
                setCurrentUser(email);
            }
        } catch (error) {
            setMessage("Failed to register. Try again.");
        }
    };

    const handleGoBackToLogin = () => {
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
