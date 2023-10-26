require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const axios = require('axios');

const app = express();

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to handle CORS preflight requests for all endpoints
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5000;

// Root endpoint
app.get('/', (req, res) => {
    res.send('DynaFit Backend is running');
});

// Register endpoint
app.post('/register', (req, res) => {
    const { email, password, name } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(`Error hashing password: ${JSON.stringify(err)}`);
            return res.status(500).json({ error: "Server error" });
        }

        const params = {
            TableName: "DynaFitUsers",
            Item: {
                email: email,
                password: hashedPassword,
                name: name
            }
        };

        dynamoDb.put(params, (error) => {
            if (error) {
                console.error(`Error: ${JSON.stringify(error)}`);
                res.status(500).json({ error: "Could not register user" });
            } else {
                res.json({ message: "User registered successfully" });
            }
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const params = {
        TableName: "DynaFitUsers",
        Key: {
            email: email
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(`Error: ${JSON.stringify(error)}`);
            return res.status(500).json({ error: "Server error" });
        }

        if (result.Item) {
            bcrypt.compare(password, result.Item.password, (err, isMatch) => {
                if (err) {
                    console.error(`Error comparing passwords: ${JSON.stringify(err)}`);
                    return res.status(500).json({ error: "Server error" });
                }

                if (isMatch) {
                    return res.json({ message: "Logged in successfully" });
                } else {
                    return res.status(401).json({ error: "Incorrect password" });
                }
            });
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    });
});

// Profile endpoint
app.get('/profile/:email', (req, res) => {
    const { email } = req.params;

    const params = {
        TableName: "DynaFitUsers",
        Key: {
            email: email
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(`Error: ${JSON.stringify(error)}`);
            return res.status(500).json({ error: "Server error" });
        }

        if (result.Item) {
            const { email, name } = result.Item; // Do not return the password
            return res.json({ email, name });
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    });
});

// Update profile endpoint
app.put('/profile/update', (req, res) => {
    const { email, name } = req.body;

    const params = {
        TableName: "DynaFitUsers",
        Key: {
            email: email
        },
        UpdateExpression: "set #nameField = :nameValue",
        ExpressionAttributeNames: {
            "#nameField": "name"
        },
        ExpressionAttributeValues: {
            ":nameValue": name
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamoDb.update(params, (error, result) => {
        if (error) {
            console.error(`Error: ${JSON.stringify(error)}`);
            return res.status(500).json({ error: "Server error" });
        }

        return res.json(result.Attributes);
    });
});

// Generate workout endpoint
app.post('/generate-workout', async (req, res) => {
    let { duration, muscleGroups, equipment } = req.body;

    // Check and transform to arrays or use default values
    duration = duration || '30'; // default value of 30 minutes if not provided
    muscleGroups = Array.isArray(muscleGroups) ? muscleGroups : (typeof muscleGroups === 'string' ? muscleGroups.split(',') : []);
    equipment = Array.isArray(equipment) ? equipment : (typeof equipment === 'string' ? equipment.split(',') : []);

    const prompt = `Generate a ${duration} minute workout targeting the ${muscleGroups.join(', ')} using ${equipment.join(', ')}.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful workout planner.' },
            { role: 'user', content: prompt }
        ];

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 2500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("OpenAI response:", JSON.stringify(response.data.choices[0].message.content, null, 2));

        // Check the response structure and provide the workout plan
        if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
            const workoutPlan = response.data.choices[0].message.content.trim();
            return res.json({ workout: workoutPlan });
        } else {
            console.error(`Unexpected response format from OpenAI: ${JSON.stringify(response.data)}`);
            return res.status(500).json({ error: 'Unexpected response format from OpenAI' });
        }

    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

// Generate diet endpoint
app.post('/generate-diet', async (req, res) => {
    let { dietaryPreferences, allergies, goals } = req.body;

    // Check and transform to arrays or use default values
    dietaryPreferences = Array.isArray(dietaryPreferences) ? dietaryPreferences : (typeof dietaryPreferences === 'string' ? dietaryPreferences.split(',') : []);
    allergies = Array.isArray(allergies) ? allergies : (typeof allergies === 'string' ? allergies.split(',') : []);
    goals = Array.isArray(goals) ? goals : (typeof goals === 'string' ? goals.split(',') : []);

    const prompt = `Create a diet plan keeping in mind the following preferences: ${dietaryPreferences.join(', ')}, allergies: ${allergies.join(', ')} and aiming to achieve these goals: ${goals.join(', ')}.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful diet planner.' },
            { role: 'user', content: prompt },
        ];
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 2500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("OpenAI response:", JSON.stringify(response.data.choices[0].message.content, null, 2));

        if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
            const dietPlan = response.data.choices[0].message.content.trim();
            return res.json({ diet: dietPlan });
        } else {
            console.error(`Unexpected response format from OpenAI: ${JSON.stringify(response.data)}`);
            return res.status(500).json({ error: 'Unexpected response format from OpenAI' });
        }

    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }   
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});