require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();

// AWS Configuration -  Abdul Aziz Mohammed
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Middleware to parse JSON requests -  Abdul Aziz Mohammed
app.use(bodyParser.json());

// Middleware to handle CORS preflight requests for all endpoints -  Abdul Aziz Mohammed
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5000;

// Root endpoint -  Abdul Aziz Mohammed
app.get('/', (req, res) => {
    res.send('DynaFit Backend is running');
});

// Register endpoint -  Abdul Aziz Mohammed
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

// For converting bcrypt.compare to promise-based function. -  Abdul Aziz Mohammed
const { promisify } = require('util'); 
const { getDefaultAutoSelectFamilyAttemptTimeout } = require('net');
const compare = promisify(bcrypt.compare); 

// Login endpoint -  Abdul Aziz Mohammed
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


// Profile endpoint - Abdul Aziz Mohammed
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

// Update profile endpoint - Abdul Aziz Mohammed
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

// Generate workout endpoint - Abdul Aziz Mohammed
app.post('/generate-workout', async (req, res) => {
    let { duration, muscleGroups, equipment } = req.body;

    // Ensure duration is provided, default to '30' if not
    duration = duration || '30'; 

    // Ensure muscleGroups and equipment are arrays or convert string to arrays
    muscleGroups = Array.isArray(muscleGroups) ? muscleGroups : (typeof muscleGroups === 'string' ? muscleGroups.split(',') : []);
    equipment = Array.isArray(equipment) ? equipment : (typeof equipment === 'string' ? equipment.split(',') : []);

    // Validate that muscleGroups and equipment are not empty
    if (!muscleGroups.length || !equipment.length) {
        return res.status(400).json({ error: "Muscle groups and equipment should not be empty." });
    }

    // Create a prompt based on the provided inputs
    const prompt = `Generate a ${duration}-minute workout targeting the ${muscleGroups.join(', ')} using ${equipment.join(', ')}. Format like the following: **Warm-Up (X minutes)**  \nput warm up generated here  \n\n**Main Workout**  \n*Exercise 1 (X minutes):* for x number of set with x number of reps\n and so on. No need to number the sections`;

    try {
        // Define a series of messages for interaction with an OpenAI model
        const messages = [
            { role: 'system', content: 'You are a helpful workout planner.' },
            { role: 'user', content: prompt }
        ];

        // Send a request to an OpenAI API for generating a workout plan
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

        // Log the OpenAI response
        console.log("OpenAI response:", JSON.stringify(response.data.choices[0].message.content, null, 2));

        // Check the response structure and provide the workout plan in the response
        if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
            const workoutPlan = response.data.choices[0].message.content.trim();
            return res.json({ workout: workoutPlan });
        } else {
            console.error(`Unexpected response format from OpenAI: ${JSON.stringify(response.data)}`);
            return res.status(500).json({ error: 'Unexpected response format from OpenAI' });
        }
    } catch (error) {
        // Handle errors, log them, and return a 500 error response
        console.error('Error fetching from OpenAI:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
});


// Store workout endpoint - Abdul Aziz Mohammed

let workoutIdCounter = 1;

app.post('/store-workout', async (req, res) => {
    const { email, workout } = req.body;

    // Check if both email and workout are provided in the request body
    if (!email || !workout) {
        console.warn("Validation error: Both email and workout are required.");
        return res.status(400).json({ error: "Both email and workout are required." });
    }

    // Fetch existing workouts for the provided email
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
        // Query the DynamoDB table to retrieve existing workouts for the email
        const existingWorkouts = await dynamoDb.query(queryParams).promise();

        // Check if the user already has 7 workouts (a maximum limit)
        if (existingWorkouts.Items.length >= 7) {
            console.warn(`User ${email} already has 7 workouts. Cannot store more.`);
            return res.status(400).json({ error: "Cannot store more than 7 workouts for a user." });
        }

        // Generate a new workout ID (incremental)
        const workoutId = (existingWorkouts.Items.length + 1).toString();

        // Define parameters to store the new workout in DynamoDB
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
            Item: {
                "email ": email,
                "workoutId": workoutId,
                "workout": workout
            }
        };

        // Store the workout in DynamoDB
        await dynamoDb.put(params).promise();

        // Log and respond with a success message and the workout ID
        console.info(`Workout stored successfully for email: ${email}, workoutId: ${workoutId}`);
        res.json({ message: "Workout stored successfully", workoutId: workoutId });
    } catch (error) {
        // Handle errors, log them, and return a 500 error response
        console.error(`Error storing or fetching workout for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not process request: ${error.message}` });
    }
});

// Fetch workouts endpoint - Minjae Chae
app.get('/fetch-workouts/:email', async (req, res) => {
    const { email } = req.params;

    // Check if the email parameter is provided in the request
    if (!email) {
        console.warn("Validation error: Email is required to fetch workouts.");
        return res.status(400).json({ error: "Email is required." });
    }

    // Define DynamoDB query parameters to retrieve workouts associated with the provided email
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
        // Query the DynamoDB table to fetch workouts
        const result = await dynamoDb.query(params).promise();

        // Log and respond with the fetched workouts
        console.info(`Fetched workouts for email: ${email}. Count: ${result.Items.length}`);
        res.json(result.Items);
    } catch (error) {
        // Handle errors, log them, and return a 500 error response
        console.error(`Error fetching workouts for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not fetch workouts: ${error.message}` });
    }
});

// Delete workout endpoint - Minjae Chae
app.delete('/delete-workout/:email/:workoutId', async (req, res) => {
    const { email, workoutId } = req.params;

    // Check if both email and workoutId parameters are provided in the request
    if (!email || !workoutId) {
        console.warn("Validation error: Both email and workoutId are required.");
        return res.status(400).json({ error: "Both email and workoutId are required." });
    }

    // Define parameters to specify the workout to be deleted
    const params = {
        TableName: process.env.DYNAMO_TABLE_NAME || "DynaFitWorkouts",
        Key: {
            "email ": email,
            "workoutId": workoutId
        }
    };

    try {
        // Delete the specified workout from DynamoDB
        await dynamoDb.delete(params).promise();

        // Log and respond with a success message
        console.info(`Workout deleted successfully for email: ${email}, workoutId: ${workoutId}`);
        res.json({ message: "Workout deleted successfully" });
    } catch (error) {
        // Handle errors, log them, and return a 500 error response
        console.error(`Error deleting workout for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not delete workout: ${error.message}` });
    }
});

// Generate diet endpoint -- Grace Testcase 20 Generate Diet
//this code sends the prompt to the GPT API and requests for the diet to be generated
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
    //prompt to ask for customized diet
    const prompt = `Create a 3 day diet plan keeping in mind the following ${prompts.join(', ')}Format like the following, do not include bullets:  \n
                        **Day 1**  \n**Breakfast**: this is the breakfast generated  \n**Lunch**: this is the lunch generated  \n**Dinner**: this is the dinner generated`;

    //giving context to API
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
            return res.json({ diet: dietPlan }); //return diet plan 
        } else {
            console.error(`Unexpected response format from OpenAI: ${JSON.stringify(response.data)}`);
            return res.status(500).json({ error: 'Unexpected response format from OpenAI' }); //return error if soemthing went wrong 
        }

    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }   
});

//Store Diet Plan Endpoint -- Grace Testcase 31 Save Diet
app.post('/store-diet', async (req, res) => {
    const { email, dietPlan } = req.body;

    //catch errors
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

    //storing diet in database
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

    //fetching diet plans from database 
    try {
        const result = await dynamoDb.query(params).promise();
        console.info(`Fetched diet plans for email: ${email}. Count: ${result.Items.length}`);
        res.json(result.Items);
    } catch (error) {
        console.error(`Error fetching diet plans for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not fetch diet plans: ${error.message}` });
    }
});

// Fetch Diet Plan Endpoint
app.get('/fetch-diets/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        console.warn("Validation error: Email is required to fetch diet plans.");
        return res.status(400).json({ error: "Email is required." });
    }

    const params = {
        TableName: "DynaFitDiets",
        FilterExpression: "#email = :emailValue",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":emailValue": email
        }
    };

    try {
        const result = await dynamoDb.scan(params).promise();
        console.info(`Fetched diet plans for email: ${email}. Count: ${result.Items.length}`);
        res.json(result.Items);
    } catch (error) {
        console.error(`Error fetching diet plans for email: ${email}. Error: ${JSON.stringify(error)}`);
        res.status(500).json({ error: `Could not fetch diet plans: ${error.message}` });
    }
});


//Generate Amount Of Water Needed To Reach Goals (Kay Lin) TC11 Generating Goals
//The goal is to send this information to the api to generate our results
app.post('/generate-water', async (req, res) => {
    let { amountOfWater, unitOfWater} = req.body;
//This sets the string that it takes in
    amountOfWater = Array.isArray(amountOfWater) ? amountOfWater : (typeof amountOfWater === 'string' ? amountOfWater.split(',') : []);
    unitOfWater = Array.isArray(unitOfWater) ? unitOfWater : (typeof unitOfWater === 'string' ? unitOfWater.split(',') : []);
//Makes sure that it is not empty
    if (!amountOfWater.length || !unitOfWater.length) {
        return res.status(400).json({ error: "Amount of water and unit of water should not be empty." });
    }
//This is the prompt fed to the api
    const prompt = `If I take in ${amountOfWater.join(', ')}, ${unitOfWater.join(', ')} how much more water do I need to reach my daily intake as an average human.`;

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful water counter.' },
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

        // Check the response structure and provide the water tracking
        if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
            const waterTracker = response.data.choices[0].message.content.trim();
            return res.json({ water: waterTracker });
        } else {
            console.error(`Unexpected response format from OpenAI: ${JSON.stringify(response.data)}`);
            return res.status(500).json({ error: 'Unexpected response format from OpenAI' });
        }
//Catch any errors that may occur
    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});