import React, { Component } from 'react'; //adam and kk wrote this page
// kk did front end, hydration error message, sliders for weight and height, share progress
//adam did name, dob, bmi calc, age calc, add remove goal, reset hydration, motivational quotes

const motivationalQuotes = [ //adam code
    "Don't limit your challenges, challenge your limits.",
    "It's never too late to become what you might have been.",
    "Do something today that your future self will thank you for.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "You are never too old to set another goal or to dream a new dream.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "The future depends on what you do today.",
    "Your time is limited, don't waste it living someone else's life.",
    "The only person you are destined to become is the person you decide to be.",
];

function getRandomMotivationalQuote() {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

class Profile extends Component { //adam code
    constructor(props) {
        super(props);
        const savedState = JSON.parse(localStorage.getItem('profileState')) || {};
        this.state = {
            name: savedState.name || '',
            dob: savedState.dob || '',
            weight: savedState.weight || 50, // Default weight
            height: savedState.height || 160, // Default height
            gender: savedState.gender || 'male',
            bmi: savedState.bmi || null,
            bmiCategory: savedState.bmiCategory || '',
            goals: savedState.goals || [],
            newGoal: '',
            motivationalQuote: getRandomMotivationalQuote(),
            workouts: savedState.workouts || [],
            newWorkout: '',
            age: savedState.age || '',
            hydrationLevel: savedState.hydrationLevel || 0, // Added hydration level
        };
    }

    componentDidMount() { //kk code
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
        if (this.state.dob) {
            this.calculateAge();
        }
        if (this.state.weight && this.state.height) {
            this.calculateBMI();
        }
    }

    componentWillUnmount() { //adam code
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
        this.saveStateToLocalStorage();
    }

    saveStateToLocalStorage = () => {
        localStorage.setItem('profileState', JSON.stringify(this.state));
    }

    handleInputChange = (event) => { //adam code
        const { name, value } = event.target;
        this.setState({ [name]: value }, () => {
            if (name === 'weight' || name === 'height') {
                this.calculateBMI();
            }
            if (name === 'dob') {
                this.calculateAge();
            }
        });
    }

    calculateBMI = () => { //adam code
        const weight = parseFloat(this.state.weight);
        const height = parseFloat(this.state.height) / 100;
        if (weight && height) {
            const bmi = (weight / (height * height)).toFixed(2);
            this.setState({
                bmi: bmi,
                bmiCategory: this.getBMICategory(bmi),
            });
        }
    }

    calculateAge = () => { // adam code
        const dob = new Date(this.state.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            this.setState({ age: age - 1 });
        } else {
            this.setState({ age: age });
        }
    }

    getBMICategory = (bmi) => { //adam code
        if (bmi < 18.5) return 'Underweight';
        if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
        if (bmi >= 24.9 && bmi < 29.9) return 'Overweight';
        return 'Obesity';
    }

    handleNewGoalChange = (event) => {
        this.setState({ newGoal: event.target.value });
    }

    addGoal = () => { //adam code
        if (this.state.newGoal.trim()) {
            this.setState(prevState => ({
                goals: [...prevState.goals, prevState.newGoal.trim()],
                newGoal: ''
            }));
        }
    }

    removeGoal = (index) => {
        this.setState(prevState => ({
            goals: prevState.goals.filter((_, i) => i !== index)
        }));
    }

    handleWorkoutChange = (event) => {
        this.setState({ newWorkout: event.target.value });
    }

    addWorkout = () => { //adam code
        if (this.state.newWorkout.trim()) {
            this.setState(prevState => ({
                workouts: [...prevState.workouts, prevState.newWorkout.trim()],
                newWorkout: ''
            }));
        }
    }

    removeWorkout = (index) => { // adam code
        this.setState(prevState => ({
            workouts: prevState.workouts.filter((_, i) => i !== index)
        }));
    }

    handleWaterIntake = () => { // KK code
        this.setState({ hydrationLevel: this.state.hydrationLevel + 1 });
    }

    resetWater = () => { // adam code
        this.setState({ hydrationLevel: 0 });
    }

    getWaterIntakeWarning = () => {
        if (this.state.hydrationLevel < 7) {
            return <p style={{ color: 'red' }}>Remember to stay hydrated! Aim for at least 7 glasses of water a day.</p>;
        }
        return null;
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log('User Profile Data:', this.state);
    }

    generateShareableText = () => { // adam code
        const {
            name,
            dob,
            age,
            weight,
            height,
            gender,
            bmi,
            bmiCategory,
            goals,
            hydrationLevel,
            workouts,
        } = this.state;

        const shareableText = `
            My Profile:
            - Name: ${name}
            - Date of Birth: ${dob}
            - Age: ${age}
            - Weight: ${weight} kg
            - Height: ${height} cm
            - Gender: ${gender}
            - BMI: ${bmi} (${bmiCategory})
            - Goals: ${goals.join(', ')}
            - Hydration Level: ${hydrationLevel} glasses
            - Workouts: ${workouts.join(', ')}
        `;

        const encodedShareableText = encodeURIComponent(shareableText);

        const shareUrl = `https://instagram.com/?text=${encodedShareableText}`;

        window.open(shareUrl, '_blank');

        alert('Profile information copied to clipboard. Paste it into your Instagram caption.');
    };

    render() { // kk did most front end 
        const { name, dob, age, weight, height, gender, bmi, bmiCategory, goals, newGoal, workouts, newWorkout, motivationalQuote } = this.state;

        const containerStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: 'auto',
            paddingTop: '10vh',
            paddingBottom: '10vh',
            background: 'white',
            marginBottom: '60px',
        };

        const formStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '90%',
            maxWidth: '320px',
            margin: '0 auto',
            padding: '20px',
            boxSizing: 'border-box',
        };

        const inputStyle = {
            width: '100%',
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid black',
            marginBottom: '20px',
        };

        const buttonStyle = {
            width: '90%',
            padding: '10px',
            borderRadius: '20px',
            background: '#0068FF',
            color: 'white',
            fontWeight: '800',
            fontSize: '22px',
            border: 'none',
            marginBottom: '20px',
            cursor: 'pointer',
            maxWidth: '320px',
        };

        return (
            <div style={containerStyle}>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'rgb(13, 71, 161)', margin: '20px 0' }}>
                    Profile
                </h2>

                <p>Motivational Quote: {motivationalQuote}</p>
                <form onSubmit={this.handleSubmit} style={formStyle}>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        placeholder="Name"
                        onChange={this.handleInputChange}
                        style={inputStyle}
                    />
                    <input
                        type="date"
                        name="dob"
                        value={dob}
                        onChange={this.handleInputChange}
                        style={inputStyle}
                    />
                    {dob && <p>Current Age: {age}</p>}
                    <div>
                        <label>Weight (kg):</label>
                        <input
                            type="range"
                            name="weight"
                            value={weight}
                            onChange={this.handleInputChange}
                            style={inputStyle}
                            min="1"
                            max="200"
                            step="1"
                        />
                        <span>{weight} kg</span>
                    </div>
                    <div>
                        <label>Height (cm):</label>
                        <input
                            type="range"
                            name="height"
                            value={height}
                            onChange={this.handleInputChange}
                            style={inputStyle}
                            min="1"
                            max="250"
                            step="1"
                        />
                        <span>{height} cm</span>
                    </div>
                    {bmi && (
                        <p>Your BMI is: {bmi} ({bmiCategory})</p>
                    )}
                    <label>Gender:</label>
                    <select
                        name="gender"
                        value={gender}
                        onChange={this.handleInputChange}
                        style={inputStyle}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <input
                        type="text"
                        name="newGoal"
                        value={newGoal}
                        placeholder="New Goal"
                        onChange={this.handleNewGoalChange}
                        style={inputStyle}
                    /> 
                    <button onClick={this.addGoal} style={buttonStyle}>Add Goal</button>
                    <ul>
                        {goals.map((goal, index) => (
                            <li key={index}>
                                {goal} <button onClick={() => this.removeGoal(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <div> 
                        <h3>Hydration Level</h3>
                        {this.getWaterIntakeWarning()}
                        <p>Number of glasses today: {this.state.hydrationLevel}</p>
                        <button onClick={this.handleWaterIntake} style={buttonStyle}>Add a glass of water</button>
                        <button onClick={this.resetWater} style={buttonStyle}>Reset Water</button>
                    </div>
                </form>
                <button onClick={this.generateShareableText} style={buttonStyle}>
                    Share Progress
                </button>
            </div>
        );
    }
}

export default Profile;