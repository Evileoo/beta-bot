import {  } from 'discord.js';
import { globals } from '../globals.js';
import express from 'express';
import axios from 'axios';
import { db } from '../connections/database.js';

export const web = {
    async loadPage(client) {

        const port = process.env.WEB_PORT || 8080;

        const app = express();

        const dirname = import.meta.dirname;

        app.use(express.static(dirname));

        app.get("/login", async (request, response) => {
            // Get parameters
            const code = request.query["code"];

            // If user didn't login to website
            if(!code) {
                const redirectUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENTID}&response_type=code&redirect_uri=${process.env.LOGIN_URI}&scope=identify`;
                return response.redirect(redirectUrl);
            }

            // Get discord access
            const res = await axios.post(
                'https://discord.com/api/oauth2/token',
                new URLSearchParams({
                    'client_id': process.env.CLIENTID,
                    'client_secret': process.env.CLIENTSECRET,
                    'grant_type': 'authorization_code',
                    'redirect_uri': process.env.LOGIN_URI,
                    'code': code
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Fetch user
            const user = await axios.get(
                'https://discord.com/api/users/@me', 
                {
                headers: {
                    authorization: `${res.data.token_type} ${res.data.access_token}`
                }
            });

            // Check if the user already has a key
            const exists = await db.query(`SELECT * FROM api_access WHERE discord_id = '${user.data.id}'`);
            // and update database
            if(exists.length > 0) {
                await db.query(`UPDATE api_access SET token_type = '${res.data.token_type}', access_token = '${res.data.access_token}', refresh_token = '${res.data.refresh_token}', url_code = '${code}' WHERE discord_id = '${user.data.id}'`);
            } else {
                await db.query(`INSERT INTO api_access (token_type, access_token, refresh_token, discord_id, url_code) VALUES ('${res.data.token_type}', '${res.data.access_token}', '${res.data.refresh_token}', '${user.data.id}', '${code}')`);
            }

            // Go to main page
            return response.redirect(`${process.env.MAIN_PAGE_URI}?discord_id=${user.data.id}`);
        });

        app.get("/generate", async (request, response) => {
            // Get parameters
            const discord_id = request.query["discord_id"];

            // If no discord id is received, login
            if(!discord_id) {
                return response.redirect(`${process.env.LOGIN_URI}`);
            }

            // Check if the main page has already been called
            const exists = await db.query(`SELECT * FROM api_access WHERE discord_id = '${discord_id}'`);

            if(exists.length > 0) {

                // Generate key
                const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
                let key = "";
                const keyLength = 15;

                while(key.length < keyLength) {
                    key += characters.charAt(Math.floor(Math.random() * characters.length));
                }

                // Generate expiration date
                const limit = 7;
                const today = new Date();
                const expiration = new Date();
                expiration.setDate(today.getDate() + limit);

                await db.query(`UPDATE api_access SET api_key = '${key}', api_key_expiration = '${expiration.toISOString()}' WHERE discord_id = '${discord_id}'`);

                return response.redirect(`${process.env.MAIN_PAGE_URI}/?discord_id=${discord_id}`); 
            } else {
                return response.redirect(`${process.env.LOGIN_URI}`);
            }
        });

        app.get("/", async (request, response) => {
            // Get parameters
            const discord_id = request.query["discord_id"];
            
            // If no discord id is received, login
            if(!discord_id) {
                return response.redirect(`${process.env.LOGIN_URI}`);
            }

            // Get the user api key
            const key = await db.query(`SELECT api_key, api_key_expiration FROM api_access WHERE discord_id = '${discord_id}'`);

            if(key.length == 0 || key[0].api_key == null) {
                return response.redirect(`${process.env.MAIN_PAGE_URI}/generate?discord_id=${discord_id}`); 
            }
            
            // Generate date object
            const date = new Date(key[0].api_key_expiration);

            return response.send(`
                <h1>Clé d'API</h1>
                <input type="password" value="${key[0].api_key}"/>
                <input type="button" value="copier" onclick="navigator.clipboard.writeText('${key[0].api_key}');"/>
                <input type="button" value="regénérer" onclick="window.location='/generate?discord_id=${discord_id}';"/>
                <br>
                Date et heure d'expiration: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
            `);

        });

        app.listen(port, () => console.log(`Web server connected at port ${port}`));
    }
};