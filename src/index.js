import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import bodyParser from 'body-parser';
import { bot } from './bot/bot.js';
import { apiGetRoles } from './api/roles.js';
import { web } from './web/load.js';

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Start the discord bot
await bot.start(client);

// Create the api instance
const app = express();
app.use(bodyParser.json());
const port = process.env.API_PORT || 3000;

// Login to the api
app.listen(port, () => {
    console.log(`API connected at port ${port}`);
});

app.get('/api/hello', async (req, res) => {
    const roles = await apiGetRoles(client, req.query);

    if(roles.hasOwnProperty("message")) {
        return res.json(roles);
    }
    res.json({ message: `${req.accepted}` });
});

// Start web page
await web.loadPage(client);