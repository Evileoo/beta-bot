import {  } from 'discord.js';
import { globals } from '../globals.js';
import express from 'express';

export const web = {
    async loadPage(client) {
        const app = express();

        app.get('/', (request, response) => {
        	return response.sendFile('index.html', { root: './src/web/' });
        });

        app.listen(process.env.WEB_PORT, () => console.log(`App listening at http://localhost:${process.env.WEB_PORT}`));
    }
};