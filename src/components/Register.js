// Abdul Aziz Mohammed
import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
                setCurrentUser({ email });
                navigate('/'); // Redirect to dashboard or home page after successful registration
            }            
        } catch (error) {
            setMessage("Failed to register. Try again.");
        }
    };

    // Reusing the same style object from Login.js for consistency
    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '90%',
        maxWidth: '320px',
        margin: '0 auto',
    };

    return (
        <div className="Desktop1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: 'auto', paddingTop: '10vh', background: 'white' }}>
            <h1 style={{ fontSize: 36, fontWeight: '800', marginTop: '20px', marginBottom: '20px' }}>Create Account</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    style={{ width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid black', marginBottom: '20px' }}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
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
                    Register
                </button>
                <div style={{ fontWeight: '800', marginTop: '20px' }}>
                    Already have an account? <Link to="/" style={{ color: '#0068FF', fontWeight: '400' }}>Login</Link>
                </div>
            </form>
            {message && <p style={{ textAlign: 'center', color: 'red' }}>{message}</p>}
        </div>
    );
}

export default Register;
