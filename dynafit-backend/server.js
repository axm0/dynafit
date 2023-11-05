require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    // Validation: Check if email, password, and name are provided
    if (!email || !password || !name) {
        console.warn("Validation error: Email, password, and name are required.");
        return res.status(400).json({ error: "Email, password, and name are required." });
    }

    try {
        // Check if a user with the provided email already exists
        const paramsCheck = {
            TableName: "DynaFitUsers",
            Key: {
                email: email
            }
        };

        const checkResult = await dynamoDb.get(paramsCheck).promise();
        if (checkResult.Item) {
            console.warn(`User with email: ${email} already exists.`);
            return res.status(409).json({ error: "User with this email already exists." });
        }

        // Hash the password
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                console.error(`Error hashing password: ${JSON.stringify(err)}`);
                return res.status(500).json({ error: "Server error" });
            }

            const params = {
                TableName: "DynaFitUsers",
                Item: {
                    email: email,       // Email as a string, as expected by your DynamoDB
                    password: hashedPassword,
                    name: name
                }
            };

            try {
                await dynamoDb.put(params).promise();
                console.info(`User with email: ${email} registered successfully.`);
                res.json({ message: "User registered successfully" });
            } catch (error) {
                console.error(`Error: ${JSON.stringify(error)}`);
                res.status(500).json({ error: "Could not register user" });
            }
        });
    } catch (error) {
        console.error(`Error checking user existence: ${JSON.stringify(error)}`);
        res.status(500).json({ error: "Internal server error" });
    }
});


const { promisify } = require('util'); // For converting bcrypt.compare to promise-based function.
const { getDefaultAutoSelectFamilyAttemptTimeout } = require('net');
const compare = promisify(bcrypt.compare); 

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation: Check if email and password are provided
    if (!email || !password) {
        console.warn("Validation error: Email and password are required.");
        return res.status(400).json({ error: "Email and password are required." });
    }

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
            compare(password, result.Item.password)
                .then(isMatch => {
                    if (isMatch) {
                        return res.json({ message: "Logged in successfully" });
                    } else {
                        console.warn(`Login attempt with incorrect password for email: ${email}`);
                        return res.status(401).json({ error: "Invalid email or password" }); // Using a generic message for security.
                    }
                })
                .catch(err => {
                    console.error(`Error comparing passwords: ${JSON.stringify(err)}`);
                    return res.status(500).json({ error: "Server error" });
                });
        } else {
            console.warn(`Login attempt for non-existent email: ${email}`);
            return res.status(401).json({ error: "Invalid email or password" }); // Using a generic message for security.
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

    duration = duration || '30'; 

    muscleGroups = Array.isArray(muscleGroups) ? muscleGroups : (typeof muscleGroups === 'string' ? muscleGroups.split(',') : []);
    equipment = Array.isArray(equipment) ? equipment : (typeof equipment === 'string' ? equipment.split(',') : []);

    if (!muscleGroups.length || !equipment.length) {
        return res.status(400).json({ error: "Muscle groups and equipment should not be empty." });
    }

    const prompt = `Generate a ${duration}-minute workout targeting the ${muscleGroups.join(', ')} using ${equipment.join(', ')}.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful workout planner.' },
            { role: 'user', content: prompt }
        ];

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: messages,
            max_tokens: 5000
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

// Store workout endpoint

let workoutIdCounter = 1;

app.post('/store-workout', async (req, res) => {
    const { email, workout } = req.body;

    if (!email || !workout) {
        console.warn("Validation error: Both email and workout are required.");
        return res.status(400).json({ error: "Both email and workout are required." });
    }

    // Fetch existing workouts for this email
    const queryParams = {
        TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
        KeyConditionExpression: "#email = :emailValue",
        ExpressionAttributeNames: {
            "#email": "email "
        },
        ExpressionAttributeValues: {
            ":emailValue": email
        }
    };

    try {
        const existingWorkouts = await dynamoDb.query(queryParams).promise();

        if (existingWorkouts.Items.length >= 7) {
            console.warn(`User ${email} already has 7 workouts. Cannot store more.`);
            return res.status(400).json({ error: "Cannot store more than 7 workouts for a user." });
        }

        const workoutId = (existingWorkouts.Items.length + 1).toString();

        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
            Item: {
                "email ": email,
                "workoutId": workoutId,
                "workout": workout
            }
        };

        await dynamoDb.put(params).promise();
        console.info(`Workout stored successfully for email: ${email}, workoutId: ${workoutId}`);
        res.json({ message: "Workout stored successfully", workoutId: workoutId });

    } catch (error) {
        console.error(`Error storing or fetching workout for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not process request: ${error.message}` });
    }
});

// Delete workout endpoint
app.delete('/delete-workout/:email/:workoutId', async (req, res) => {
    const { email, workoutId } = req.params;

    if (!email || !workoutId) {
        console.warn("Validation error: Both email and workoutId are required.");
        return res.status(400).json({ error: "Both email and workoutId are required." });
    }

    const params = {
        TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
        Key: {
            "email ": email,
            "workoutId": workoutId
        }
    };

    try {
        await dynamoDb.delete(params).promise();
        console.info(`Workout deleted successfully for email: ${email}, workoutId: ${workoutId}`);
        res.json({ message: "Workout deleted successfully" });
    } catch (error) {
        console.error(`Error deleting workout for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not delete workout: ${error.message}` });
    }
});

// Fetch workouts endpoint
app.get('/fetch-workouts/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        console.warn("Validation error: Email is required to fetch workouts.");
        return res.status(400).json({ error: "Email is required." });
    }

    const params = {
        TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
        KeyConditionExpression: "#email = :emailValue",
        ExpressionAttributeNames: {
            "#email": "email "
        },
        ExpressionAttributeValues: {
            ":emailValue": email
        }
    };
    try {
        const result = await dynamoDb.query(params).promise();
        console.info(`Fetched workouts for email: ${email}. Count: ${result.Items.length}`);
        res.json(result.Items);
    } catch (error) {
        console.error(`Error fetching workouts for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not fetch workouts: ${error.message}` });
    }
});

// Generate diet endpoint
app.post('/generate-diet', async (req, res) => {
    let { preferences, allergies, goals } = req.body;

    preferences = Array.isArray(preferences) ? preferences : (typeof preferences === 'string' ? preferences.split(',').map(p => p.trim()) : []);
    allergies = Array.isArray(allergies) ? allergies : (typeof allergies === 'string' ? allergies.split(',').map(a => a.trim()) : []);
    goals = Array.isArray(goals) ? goals : (typeof goals === 'string' ? goals.split(',').map(g => g.trim()) : []);

    if (!preferences.length && !allergies.length && !goals.length) {
        return res.status(400).json({ error: "At least one of preferences, allergies, or goals must be provided." });
    }

    const prompts = [];
    if (preferences.length) prompts.push(`preferences: ${preferences.join(', ')}`);
    if (allergies.length) prompts.push(`allergies: ${allergies.join(', ')}`);
    if (goals.length) prompts.push(`goals: ${goals.join(', ')}`);
    const prompt = `Create a diet plan keeping in mind the following ${prompts.join(', ')}.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful diet planner.' },
            { role: 'user', content: prompt },
        ];
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: messages,
            max_tokens: 5000
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

//Store Diet Plan Endpoint
app.post('/store-diet', async (req, res) => {
    const { email, dietPlan } = req.body;

    if (!email || !dietPlan) {
        console.warn("Validation error: Both email and dietPlan are required.");
        return res.status(400).json({ error: "Both email and dietPlan are required." });
    }

    const queryParams = {
        TableName: "DynaFitDiets",
        KeyConditionExpression: "#email = :emailValue",
        ExpressionAttributeNames: {
            "#email": "email "
        },
        ExpressionAttributeValues: {
            ":emailValue": email
        }
    };

    try {
        const existingDiets = await dynamoDb.query(queryParams).promise();

        if (existingDiets.Items.length >= 7) {
            console.warn(`User ${email} already has 7 diet plans. Cannot store more.`);
            return res.status(400).json({ error: "Cannot store more than 7 diet plans for a user." });
        }

        const dietID = `diet_${existingDiets.Items.length + 1}`;

        const params = {
            TableName: "DynaFitDiets",
            Item: {
                "email ": email,
                "DietID": dietID,
                "dietPlan": dietPlan
            }
        };

        await dynamoDb.put(params).promise();
        console.info(`Diet plan stored successfully for email: ${email}, dietID: ${dietID}`);
        res.json({ message: "Diet plan stored successfully", dietID: dietID });

    } catch (error) {
        console.error(`Error storing or fetching diet plan for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not process request: ${error.message}` });
    }
});

//Fetch Diet Plan Endpoint
app.get('/fetch-diets/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        console.warn("Validation error: Email is required to fetch diet plans.");
        return res.status(400).json({ error: "Email is required." });
    }

    const params = {
        TableName: "DynaFitDiets",
        KeyConditionExpression: "#email = :emailValue",
        ExpressionAttributeNames: {
            "#email": "email "
        },
        ExpressionAttributeValues: {
            ":emailValue": email
        }
    };

    try {
        const result = await dynamoDb.query(params).promise();
        console.info(`Fetched diet plans for email: ${email}. Count: ${result.Items.length}`);
        res.json(result.Items);
    } catch (error) {
        console.error(`Error fetching diet plans for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not fetch diet plans: ${error.message}` });
    }
});

//Delete Diet Plan Endpoint
app.delete('/delete-diet/:email/:DietID', async (req, res) => {
    let { email, DietID } = req.params;

    email = email.trim();
    DietID = DietID.trim();

    if (!email || !DietID) {
        console.warn("Validation error: Both email and DietID are required.");
        return res.status(400).json({ error: "Both email and DietID are required." });
    }

    console.log(`Attempting to delete diet with email: '${email}' and DietID: '${DietID}'`);

    const params = {
        TableName: "DynaFitDiets",
        Key: {
            "email ": email,
            "DietID": DietID
        }
    };

    try {
        await dynamoDb.delete(params).promise();
        console.info(`Diet plan deleted successfully for email: ${email}, DietID: ${DietID}`);
        res.json({ message: "Diet plan deleted successfully" });
    } catch (error) {
        console.error(`Error deleting diet plan for email: ${email}, DietID: ${DietID}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not delete diet plan: ${error.message}` });
    }
});

//Generate Amount Of Water Needed To Reach Goals
app.post('/generate-water', async (req, res) => {
    let { amountOfWater, unitOfWater} = req.body;

    amountOfWater = Array.isArray(amountOfWater) ? amountOfWater : (typeof amountOfWater === 'string' ? amountOfWater.split(',').map(p => p.trim()) : []);
    unitOfWater = Array.isArray(unitOfWater) ? unitOfWater : (typeof unitOfWater === 'string' ? unitOfWater.split(',').map(a => a.trim()) : []);

    if (!amountOfWater.length && !unitOfWater.length) {
        return res.status(400).json({ error: "Both Items must be provided." });
    }

    const prompts = [];
    if (preferences.length) prompts.push(`amountOfWater: ${amountOfWater.join(', ')}`);
    if (allergies.length) prompts.push(`unitOfWater: ${unitOfWater.join(', ')}`);
    const prompt = `If I drank ${prompts.join(', ')} of water, based on the average human, How much more water will I have to drink to satisfy my daily intake?.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful goal giver.' },
            { role: 'user', content: prompt },
        ];
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: messages,
            max_tokens: 5000
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