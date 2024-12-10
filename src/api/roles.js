import {  } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export async function apiGetRoles(client, params) {

    let server;
    const roles = [];

    // Check the api key
    if(!params.hasOwnProperty("key")) {
        return {
            message: `La clé d'API n'a pas été fournie`
        }
    }

    const keyCheck = await db.query(`SELECT api_key_expiration FROM api_access WHERE api_key = '${params.key}'`);

    if(keyCheck.length == 0 || keyCheck[0].api_key_expiration == null) {
        return {
            message: `Clé d'API fournie incorrecte`
        }
    }

    const today = new Date();
    const expiration = new Date(keyCheck[0].api_key_expiration);

    if(today > expiration) {
        return {
            message: `Clé d'API expirée`
        }
    }

    // Check received data
    if(!params.hasOwnProperty("serverID")) {
        return {
            message: `L'identifiant du serveur n'a pas été fourni`
        }
    }

    if(!params.hasOwnProperty("members")) {
        return {
            message: `Aucun membre n'a été fourni`
        }
    }


    // Fetch data

    const members = params.members.split(",");

    //1156666614561902592
    // get the server
    try {
        server = await client.guilds.fetch(params.serverID);
    } catch(error) {
        return {
            message: `Identifiant de serveur incorrect`
        }
    }
    
    //role: 1156942393950617690 member: 398358008838488077
    for(let m of members) {
        let member;
        
        try {
            member = await server.members.fetch(m);
        } catch(error) {
            return {
                message: `Membre donné inexistant sur le serveur donné`
            }
        }

        const memberRoles = member.roles.cache.map(m => new Object({id: m.id, name: m.name}));

        const rolesObject = {
            member: {
                id: member.id,
                username: member.user.username,
                globalName: member.user.globalName
            }
        }

        if(params.hasOwnProperty("roles")) {
            const rolesToCheck = params.roles.split(",");
            const rolesSet = new Set(rolesToCheck);
            const hasRoles = memberRoles.filter(value => rolesSet.has(value.id));

            rolesObject.roles = hasRoles;
        } else {
            rolesObject.roles = memberRoles;
        }

        roles.push(rolesObject);
    }

    return roles;
}