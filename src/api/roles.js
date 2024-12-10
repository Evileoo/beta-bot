import {  } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';
import { apiKeyCheck } from './keyCheck.js';

export async function apiGetRoles(client, params) {

    let guild;
    const roles = [];

    // Check the api key
    if(!params.hasOwnProperty("key")) {
        return {
            status: "error",
            code: "001",
            message: `La clé d'API n'a pas été fournie`,
            value: []
        }
    }

    const keyCheck = await apiKeyCheck(params.key);

    if(keyCheck) return keyCheck;

    // Check received data
    if(!params.hasOwnProperty("guildID")) {
        return {
            status: "error",
            code: "010",
            message: `L'identifiant de guilde n'a pas été fourni`,
            value: []
        }
    }

    if(!params.hasOwnProperty("members")) {
        return {
            status: "error",
            code: "020",
            message: `Aucun membre fourni`,
            value: []
        }
    }

    const membersId = params.members.split(",");
    const members = [];

    //1156666614561902592
    // get the guild
    try {
        guild = await client.guilds.fetch(params.guildID);
    } catch(error) {
        return {
            status: "error",
            code: "011",
            message: `L'identifiant de guilde est incorrect`,
            value: []
        }
    }

    // get members
    for(let memberId of membersId) {
        try {
            members.push(await guild.members.fetch(memberId));
        } catch(error) {
            return {
                status: "error",
                code: "021",
                message: `L'identifiant ${memberId} ne correspond à aucun membre dans la guilde`,
                value: []
            }
        }
    }
    
    //role: 1156942393950617690 member: 398358008838488077
    for(let member of members) {
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

    return {
        status: "success",
        code: "000",
        message: `Ok`,
        value: roles
    }
}

export async function apiSetRoles(client, params) {

    // Check the api key
    if(!params.hasOwnProperty("key")) {
        return {
            message: `La clé d'API n'a pas été fournie`
        }
    }

    const keyCheck = await apiKeyCheck(params.key);

    if(keyCheck) return keyCheck;

    // Check received data
    if(!params.hasOwnProperty("guildID")) {
        return {
            message: `L'identifiant du guilde n'a pas été fourni`
        }
    }

    if(!params.hasOwnProperty("members")) {
        return {
            message: `Aucun membre n'a été fourni`
        }
    }

    if(!params.hasOwnProperty("roles")) {
        return {
            message: `Aucun role n'a été fourni`
        }
    }

    //1156666614561902592
    // get the guild
    let guild;
    try {
        guild = await client.guilds.fetch(params.guildID);
    } catch(error) {
        return {
            message: `Identifiant de guilde incorrect`
        }
    }

    const membersId = params.members.split(",");
    const rolesId = params.roles.split(",");
    const members = [];

    for(let memberId of membersId) {
        try {
            members.push(await guild.members.fetch(memberId));
        } catch(error) {
            return {
                message: `Membre ${memberId} inexistant sur la guilde donnée`
            }
        }
    }

    //1272492338266243158
    // get the role
    for(let roleId of rolesId) {

        let role;

        try {
            role = await guild.roles.cache.find(r => r.id == roleId);
        } catch(error) {
            return {
                message: `Identifiant de role incorrect`
            }
        }

        for(let member of members) {
            await member.roles.add(roleId);
        }
    }

    return {
        message: "ok"
    }

}