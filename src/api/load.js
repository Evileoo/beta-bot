import {  } from 'discord.js';
import { globals } from '../globals.js';
import bodyParser from 'body-parser';
import express from 'express';
import { apiGetRoles, apiSetRoles } from './roles.js';

export const api = {
    async load(client) {
        const app = express();
        app.use(bodyParser.json());
        const port = process.env.API_PORT || 4000;

        // Login to the api
        app.listen(port, () => {
            console.log(`API connected at port ${port}`);
        });

        app.get('/api/getRoles', async (req, res) => {
            const roles = await apiGetRoles(client, req.query);
            res.json(roles);
        });

        app.get('/api/setRoles', async (req, res) => {
            const roles = await apiSetRoles(client, req.query);
        
            if(roles.hasOwnProperty("message")) {
                return res.json(roles);
            }
            res.json(roles);
        });
    }
};