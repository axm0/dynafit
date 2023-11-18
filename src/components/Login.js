// Abdul Aziz Mohammed
import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import DLogo from '../D.svg';

function Login() {
    // Using hooks to manage component state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setCurrentUser } = useAuth();

    // Function to handle form submission for user login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { email, password });
            setMessage(response.data.message);

            // If login is successful, set the user as logged in
            if (response.data.message === "Logged in successfully") {
                setCurrentUser({ email });
            }
        } catch (error) {
            setMessage("Failed to login. Check your credentials.");
        }
    };

    // Responsive styling for mobile
    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // This centers the children horizontally
        width: '90%',
        maxWidth: '320px', // You can adjust this width as needed
        margin: '0 auto', // This centers the form container itself horizontally
    };

    // Render the component's UI
    return (
        <div className="Desktop1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: 'auto', paddingTop: '10vh', background: 'white' }}>
            <h1 style={{ fontSize: 36, fontWeight: '800', marginTop: '20px', marginBottom: '20px' }}>Welcome back</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    style={{ width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid black', marginBottom: '20px' }}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    style={{ width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid black', marginBottom: '20px' }}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    style={{ width: '100%', padding: '10px', borderRadius: '20px', background: '#0068FF', color: 'white', fontWeight: '800', fontSize: '24px', border: 'none', marginBottom: '20px' }}
                    type="submit"
                >
                    Continue
                </button>
                <div style={{ fontWeight: '800', marginTop: '20px' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#0068FF', fontWeight: '400' }}>Sign Up</Link>
                </div>
            </form>
            {message && <p style={{ textAlign: 'center', color: 'red' }}>{message}</p>}
        </div>
    );
}

export default Login;

