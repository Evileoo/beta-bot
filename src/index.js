import { Client, GatewayIntentBits } from 'discord.js';
import { bot } from './bot/bot.js';
import { web } from './web/load.js';
import { api } from './api/load.js';

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Start the discord bot
await bot.start(client);

// Create the api instance
await api.load(client);

// Start web page
await web.loadPage(client);