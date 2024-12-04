import {  } from 'discord.js';
import { globals } from '../globals.js';
import express from 'express';

export const web = {
    async loadPage(client) {

        const port = process.env.WEB_PORT || 8080;

        const app = express();

        app.get('/', (request, response) => {
        	return response.sendFile('index.html', { root: './src/web/' });
        });

        app.listen(port, () => console.log(`Web server connected at port ${port}`));
    }
};