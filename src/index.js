import { bot } from './bot/bot.js';
import { web } from './web/load.js';
import { api } from './api/load.js';

// Create client instance
const client = await bot.start();

// Create the api instance
await api.load(client);

// Start web page
await web.loadPage(client);