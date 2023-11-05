import React from 'react';
import './App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import WorkoutDashboard from './components/WorkoutDashboard';
import GenerateWorkout from './components/GenerateWorkout';
import ViewPastWorkouts from './components/ViewPastWorkouts';
import GenerateDiet from './components/GenerateDiet';
import ViewSavedDiets from './components/ViewSavedDiets';
import DietDashboard from './components/DietDashboard';
import Register from './components/Register';
import Profile from './components/Profile'; // Make sure Profile is imported
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
        <h2>DynaFit</h2>
      </header>
      <main>
        <Routes>
          {!currentUser ? (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Login />} />
            </>
          ) : (
            <>
              <Route path="/workout-dashboard" element={<WorkoutDashboard />} />
              <Route path="/generate-workout" element={<GenerateWorkout />} />
              <Route path="/view-past-workouts" element={<ViewPastWorkouts />} />
              <Route path="/diet" element={<GenerateDiet />} />
              <Route path="/view-saved-diets" element={<ViewSavedDiets />} />
              <Route path="/diet-dashboard" element={<DietDashboard />} />
              <Route path="/profile" element={<Profile />} /> {/* Add the Profile route here */}
              <Route path="/logout" element={<Logout />} />
              <Route path="/" element={<WorkoutDashboard />} />
              {/* If you want a default fallback route for logged-in users, you can use:
              <Route path="*" element={<WorkoutDashboard />} /> */}
            </>
          )}
        </Routes>
      </main>
      {currentUser && <BottomNavigation />}
    </div>
  );
}

export default App;
