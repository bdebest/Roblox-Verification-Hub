// This server handles all external communication with Roblox (OAuth & Group API).
// You will implement the full Roblox OAuth and Group API logic here.

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- DATABASE CONNECTION PLACEHOLDER (Use Firestore or MongoDB Atlas) ---
// Initialize your database connection here. For instance, if using Firebase:
// const db = initializeFirebaseApp(); 
console.log("Database connection placeholder established.");
// ------------------------------------------------------------------------


// --- 1. HEALTH CHECK (Render requirement) ---
app.get('/', (req, res) => {
    res.send('Roblox Verification Hub is running and healthy!');
});


// --- 2. ROBlox OAUTH START POINT ---
// This is the endpoint the Discord bot will link to: 
// https://your-verification-hub.onrender.com/auth/roblox?discordId=...&guildId=...
app.get('/auth/roblox', (req, res) => {
    const { discordId, guildId } = req.query;
    
    // IMPORTANT: In a real implementation, you would generate a unique state token
    // and store it temporarily with the discordId to prevent CSRF attacks.
    const state = JSON.stringify({ discordId, guildId }); 

    const robloxAuthUrl = `https://apis.roblox.com/oauth/v1/authorize?
client_id=${process.env.ROBLOX_CLIENT_ID}&
response_type=code&
redirect_uri=${process.env.ROBLOX_REDIRECT_URI}&
scope=${process.env.ROBLOX_SCOPES}&
state=${encodeURIComponent(state)}`;

    // Redirect the user to Roblox for authorization
    res.redirect(robloxAuthUrl.replace(/\n/g, ''));
});


// --- 3. ROBlox OAUTH CALLBACK (WHERE ROBLOX SENDS THE CODE) ---
app.get('/auth/roblox/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(400).send('Verification failed: Missing code or state.');
    }

    // You must implement logic here to:
    // 1. Exchange the code for an access token (server-to-server POST request).
    // 2. Use the access token to fetch the Roblox User ID.
    // 3. Look up the Roblox user's rank in your target group using another API call.
    // 4. Decode the state to get the Discord User ID and Guild ID.
    // 5. Store the mapping (Discord ID -> Roblox ID/Rank) in your database.
    // 6. Redirect the user to a success or failure page.

    console.log(`Received code for state: ${state}`);
    // For now, just show a message.
    res.send('Verification process received! Now implement the token exchange and data storage logic here.');
});


// --- 4. INTERNAL API ENDPOINT (Called by the Discord Bot) ---
// This endpoint is secured using a header check to ensure only your Discord bot can access it.
const apiAuthMiddleware = (req, res, next) => {
    if (req.headers['x-api-key'] !== process.env.HUB_API_KEY) {
        return res.status(403).json({ success: false, message: 'Unauthorized API access.' });
    }
    next();
};

app.post('/api/get-status', apiAuthMiddleware, async (req, res) => {
    const { discordId } = req.body;
    
    // You would look up the user's status in your database here.
    // Placeholder logic:
    if (discordId === 'example_verified_id') {
        return res.json({ 
            success: true, 
            robloxUsername: 'ExampleUser123',
            robloxId: '123456789',
            groupRankName: 'Member'
        });
    }

    res.json({ success: false, message: 'User not verified.' });
});

// Implement /api/promote and /api/demote similarly...

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Verification Hub listening on port ${port}`);
});
