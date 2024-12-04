import { REST, Routes } from 'discord.js';
import fs from 'fs';

export const deploy = {
    async refreshArena(){
        const commands = [];
        
        const generalCommandFiles = (fs.existsSync(`./src/bot/commands/general`)) ? fs.readdirSync(`./src/bot/commands/general`).filter(file => file.endsWith(`.js`)) : [];
        const generalUserContextMenuFiles = (fs.existsSync(`./src/bot/userContextMenus/general`)) ? fs.readdirSync(`./src/bot/userContextMenus/general`).filter(file => file.endsWith(`.js`)) : [];
        const generalMessageContextMenuFiles = (fs.existsSync(`./src/bot/messageContextMenus/general`)) ? fs.readdirSync(`./src/bot/messageContextMenus/general`).filter(file => file.endsWith(`.js`)) : [];
        
        const arenaCommandFiles = (fs.existsSync(`./src/bot/commands/arena`)) ? fs.readdirSync(`./src/bot/commands/arena`).filter(file => file.endsWith(`.js`)) : [];
        const arenaUserContextMenuFiles = (fs.existsSync(`./src/bot/userContextMenus/arena`)) ? fs.readdirSync(`./src/bot/userContextMenus/arena`).filter(file => file.endsWith(`.js`)) : [];
        const arenaMessageContextMenuFiles = (fs.existsSync(`./src/bot/messageContextMenus/arena`)) ? fs.readdirSync(`./src/bot/messageContextMenus/arena`).filter(file => file.endsWith(`.js`)) : [];
    
        for(const file of generalCommandFiles){
            const command = await import(`./commands/general/${file}`);
            commands.push(command.command.data.toJSON());
        }
    
        for (const file of generalUserContextMenuFiles) {
            const userContextMenu = await import(`./userContextMenus/general/${file}`);
            commands.push(userContextMenu.userContextMenu.data.toJSON());
        }
    
        for (const file of generalMessageContextMenuFiles) {
            const messageContextMenu = await import(`./messageContextMenus/general/${file}`);
            commands.push(messageContextMenu.messageContextMenu.data.toJSON());
        }
    
        for(const file of arenaCommandFiles){
            const command = await import(`./commands/arena/${file}`);
            commands.push(command.command.data.toJSON());
        }
    
        for (const file of arenaUserContextMenuFiles) {
            const userContextMenu = await import(`./userContextMenus/arena/${file}`);
            commands.push(userContextMenu.userContextMenu.data.toJSON());
        }
    
        for (const file of arenaMessageContextMenuFiles) {
            const messageContextMenu = await import(`./messageContextMenus/arena/${file}`);
            commands.push(messageContextMenu.messageContextMenu.data.toJSON());
        }
    
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        
        try{
            console.log(`Refreshing ${commands.length} applications (/) commands on Arena.`);

            // Deleting all commands
            //await rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.ARENAGUILDID), { body: [] }).catch(console.error);
            
            // Reloading them all
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENTID, process.env.ARENAGUILDID),
                { body: commands }
            );
    
            console.log(`Successfully loaded ${data.length} applications (/) commands on Arena.`);
        } catch(err){
            console.error(err);
        }
    },
    async refreshCommunity() {
        const commands = [];
        
        const generalCommandFiles = (fs.existsSync(`./src/bot/commands/general`)) ? fs.readdirSync(`./src/bot/commands/general`).filter(file => file.endsWith(`.js`)) : [];
        const generalUserContextMenuFiles = (fs.existsSync(`./src/bot/userContextMenus/general`)) ? fs.readdirSync(`./src/bot/userContextMenus/general`).filter(file => file.endsWith(`.js`)) : [];
        const generalMessageContextMenuFiles = (fs.existsSync(`./src/bot/messageContextMenus/general`)) ? fs.readdirSync(`./src/bot/messageContextMenus/general`).filter(file => file.endsWith(`.js`)) : [];
        
        const arenaCommandFiles = (fs.existsSync(`./src/bot/commands/community`)) ? fs.readdirSync(`./src/bot/commands/community`).filter(file => file.endsWith(`.js`)) : [];
        const arenaUserContextMenuFiles = (fs.existsSync(`./src/bot/userContextMenus/community`)) ? fs.readdirSync(`./src/bot/userContextMenus/community`).filter(file => file.endsWith(`.js`)) : [];
        const arenaMessageContextMenuFiles = (fs.existsSync(`./src/bot/messageContextMenus/community`)) ? fs.readdirSync(`./src/bot/messageContextMenus/community`).filter(file => file.endsWith(`.js`)) : [];
    
        for(const file of generalCommandFiles){
            const command = await import(`./commands/general/${file}`);
            commands.push(command.command.data.toJSON());
        }
    
        for (const file of generalUserContextMenuFiles) {
            const userContextMenu = await import(`./userContextMenus/general/${file}`);
            commands.push(userContextMenu.userContextMenu.data.toJSON());
        }
    
        for (const file of generalMessageContextMenuFiles) {
            const messageContextMenu = await import(`./messageContextMenus/general/${file}`);
            commands.push(messageContextMenu.messageContextMenu.data.toJSON());
        }
    
        for(const file of arenaCommandFiles){
            const command = await import(`./commands/community/${file}`);
            commands.push(command.command.data.toJSON());
        }
    
        for (const file of arenaUserContextMenuFiles) {
            const userContextMenu = await import(`./userContextMenus/community/${file}`);
            commands.push(userContextMenu.userContextMenu.data.toJSON());
        }
    
        for (const file of arenaMessageContextMenuFiles) {
            const messageContextMenu = await import(`./messageContextMenus/community/${file}`);
            commands.push(messageContextMenu.messageContextMenu.data.toJSON());
        }
    
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        
        try{

            console.log(`Refreshing ${commands.length} applications (/) commands on Community.`);

            // Deleting all commands
            //await rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.COMMUNITYGUILDID), { body: [] }).catch(console.error);

            // Reloading them all
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENTID, process.env.COMMUNITYGUILDID),
                { body: commands }
            );
    
            console.log(`Successfully loaded ${data.length} applications (/) commands on Community.`);
        } catch(err){
            console.error(err);
        }
    },
};