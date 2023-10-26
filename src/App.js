import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GenerateWorkout from './components/GenerateWorkout';
import GenerateDiet from './components/GenerateDiet';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import BottomNavigation from './components/BottomNavigation';
import { AuthProvider, useAuth } from './AuthContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0d47a1',
        },
        secondary: {
            main: '#c51162',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const { currentUser } = useAuth();

    return (
        <div className="App">
            <header className="App-header">
                <h1>DynaFit</h1>
            </header>
            <main>
                <Routes>
                    {!currentUser ? (
                        <>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </>
                    ) : (
                        <>
                            <Route path="/workout" element={<GenerateWorkout />} />
                            <Route path="/diet" element={<GenerateDiet />} />
                            <Route path="/logout" element={<Logout />} />
                        </>
                    )}
                </Routes>
            </main>
            {currentUser && <BottomNavigation />}
        </div>
    );
}

export default App;
