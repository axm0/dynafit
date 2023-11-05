import React, { Component } from 'react';

const motivationalQuotes = [
    "Don't limit your challenges, challenge your limits.",
    "It's never too late to become what you might have been.",
    "Do something today that your future self will thank you for."
];

function getRandomMotivationalQuote() {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

class Profile extends Component {
    constructor(props) {
        super(props);
        // Attempt to load saved state from localStorage
        const savedState = JSON.parse(localStorage.getItem('profileState')) || {};
        this.state = {
            weight: '',
            height: '',
            gender: 'male',
            bmi: null,
            bmiCategory: '',
            goals: [],
            newGoal: '',
            motivationalQuote: getRandomMotivationalQuote(),
            hydrationLevel: 0,
            workouts: [],
            newWorkout: '',
            ...savedState, // Use savedState to override any default values if it exists
        };
    }
    
    
    componentDidMount() {
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
        this.saveStateToLocalStorage();
    }

    saveStateToLocalStorage = () => {
        localStorage.setItem('profileState', JSON.stringify(this.state));
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value }, () => {
            if (this.state.weight && this.state.height) {
                this.calculateBMI();
            }
        });
    }

    calculateBMI = () => {
        const weight = parseFloat(this.state.weight);
        const height = parseFloat(this.state.height) / 100;
        if (weight > 0 && height > 0) {
            const bmi = (weight / (height * height)).toFixed(2);
            this.setState({ bmi }, () => {
                this.setBMICategory(bmi);
            });
        }
    }

    setBMICategory = (bmi) => {
        let bmiCategory = 'Underweight';
        if (bmi >= 18.5 && bmi < 24.9) {
            bmiCategory = 'Normal weight';
        } else if (bmi >= 24.9 && bmi < 29.9) {
            bmiCategory = 'Overweight';
        } else if (bmi >= 29.9) {
            bmiCategory = 'Obesity';
        }
        this.setState({ bmiCategory });
    }

    handleNewGoalChange = (event) => {
        this.setState({ newGoal: event.target.value });
    }

    addGoal = () => {
        if (this.state.newGoal) {
            this.setState({
                goals: [...this.state.goals, this.state.newGoal],
                newGoal: ''
            });
        }
    }

    removeGoal = (index) => {
        this.setState({
            goals: this.state.goals.filter((_, i) => i !== index)
        });
    }


    handleWaterIntake = () => {
        this.setState({ hydrationLevel: this.state.hydrationLevel + 1 });
    }

    handleNewWorkoutChange = (event) => {
        this.setState({ newWorkout: event.target.value });
    }

    addWorkout = () => {
        if (this.state.newWorkout) {
            this.setState({
                workouts: [...this.state.workouts, this.state.newWorkout],
                newWorkout: ''
            });
        }
    }

    removeWorkout = (index) => {
        this.setState({
            workouts: this.state.workouts.filter((_, i) => i !== index)
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log('User Profile Data:', this.state);
    }

    render() {
        return (
            <div>
                <h2>Profile</h2>
                <p>Motivational Quote: {this.state.motivationalQuote}</p>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label>Weight (kg):</label>
                        <input
                            type="number"
                            name="weight"
                            value={this.state.weight}
                            onChange={this.handleInputChange}
                            min="1"
                        />
                    </div>
                    <div>
                        <label>Height (cm):</label>
                        <input
                            type="number"
                            name="height"
                            value={this.state.height}
                            onChange={this.handleInputChange}
                            min="1"
                        />
                    </div>
                    <div>
                        <label>Gender:</label>
                        <select
                            name="gender"
                            value={this.state.gender}
                            onChange={this.handleInputChange}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    {this.state.bmi && (
                        <p>Your BMI is: {this.state.bmi} ({this.state.bmiCategory})</p>
                    )}
                    <button type="submit">Save Profile</button>
                </form>

                <div>
                    <h3>Your Goals</h3>
                    <input
                        type="text"
                        value={this.state.newGoal}
                        onChange={this.handleNewGoalChange}
                        placeholder="Enter your new goal"
                    />
                    <button onClick={this.addGoal}>Add Goal</button>
                    <ul>
                        {this.state.goals.map((goal, index) => (
                            <li key={index}>
                                {goal} <button onClick={() => this.removeGoal(index)}>Remove</button>
                            </li>
                        ))}

                    </ul>
                </div>

                <div>
                    <h3>Hydration Level</h3>
                    <p>Number of glasses today: {this.state.hydrationLevel}</p>
                    <button onClick={this.handleWaterIntake}>Add a glass of water</button>
                </div>

                <div>
                    <h3>Your Workouts</h3>
                    <input
                        type="text"
                        value={this.state.newWorkout}
                        onChange={this.handleNewWorkoutChange}
                        placeholder="Enter your new workout"
                    />
                    <button onClick={this.addWorkout}>Add Workout</button>
                    <ul>
                        {this.state.workouts.map((workout, index) => (
                            <li key={index}>
                                {workout} <button onClick={() => this.removeWorkout(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default Profile;
