import {  } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export async function apiKeyCheck(key) {
    const keyCheck = await db.query(`SELECT api_key_expiration FROM api_access WHERE api_key = '${key}'`);

    if(keyCheck.length == 0 || keyCheck[0].api_key_expiration == null) {
        return {
            status: "error",
            code: "002",
            message: `La clé d'API est incorrecte`,
            value: []
        }
    }

    const today = new Date();
    const expiration = new Date(keyCheck[0].api_key_expiration);

    if(today > expiration) {
        return {
            status: "error",
            code: "003",
            message: `La clé d'API est expirée`,
            value: []
        }
    }
}