import {  } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export async function apiGetRoles(client, params) {

    let server;
    let members = [];
    let roles = [];

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

    if(!params.hasOwnProperty("serverID")) {
        return {
            message: `L'identifiant du serveur n'a pas été fourni`
        }
    }

    if(!params.hasOwnProperty("member") && !params.hasOwnProperty("roleID")) {
        return {
            message: `Ni un membre ni un role n'a été fourni`
        }
    }

    if(params.hasOwnProperty("member") && params.hasOwnProperty("roleID")) {
        return {
            message: `Il ne faut fournir qu'un membre OU un role`
        }
    }

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
    // Get members
    if(params.hasOwnProperty("member")) {
        try {
            const member = await server.members.fetch(params.member);
            members.push(member.user.id);
        } catch(error) {
            return {
                message: `Membre donné inexistant sur le serveur donné`
            }
        }
    } else {
        try {
            const role = await server.roles.fetch(params.roleID);
            console.log(role.members);
        } catch(error) {
            console.error(error);
            return {
                message: `Role donné inexistant sur le serveur donné`
            }
        }
    }


    //console.log(client);
    //console.log(params);

    return 1;
}