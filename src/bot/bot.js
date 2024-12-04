import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { deploy } from './deploy-commands.js';

export const bot = {
    async start(client) {
        // Create commands collection
        client.commands = new Collection();
        const commandFoldersPath = path.join("src", "commands");
        const commandFolders = (fs.existsSync(commandFoldersPath)) ? fs.readdirSync(commandFoldersPath) : [];

        for(let folder of commandFolders) {
            const commandsPath = path.join(commandFoldersPath, folder);
            const commandFiles = (fs.existsSync(commandsPath)) ? fs.readdirSync(commandsPath).filter(file => file.endsWith(".js")) : [];

            for(let command of commandFiles) {
                const commandFile = await import(`./commands/${folder}/${command}`);
                client.commands.set(commandFile.command.data.name, commandFile.command);
            }
        }

        // Create user context menus collection
        client.userContextMenus = new Collection();
        const userContextMenusFoldersPath = path.join("src", "userContextMenus");
        const userContextMenusFolders = (fs.existsSync(userContextMenusFoldersPath)) ? fs.readdirSync(userContextMenusFoldersPath) : [];

        for(let folder of userContextMenusFolders) {
            const userContextMenusPath = path.join(userContextMenusFoldersPath, folder);
            const userContextMenuFiles = (fs.existsSync(userContextMenusPath)) ? fs.readdirSync(userContextMenusPath).filter(file => file.endsWith(".js")) : [];

            for(let userContextMenu of userContextMenuFiles) {
                const userContextMenuFile = await import(`./userContextMenus/${folder}/${userContextMenu}`);
                client.userContextMenus.set(userContextMenuFile.userContextMenu.data.name, userContextMenuFile.userContextMenu);
            }
        }

        // Create message context menus collection
        client.messageContextMenus = new Collection();
        const messageContextMenusFoldersPath = path.join("src", "messageContextMenus");
        const messageContextMenusFolders = (fs.existsSync(messageContextMenusFoldersPath)) ? fs.readdirSync(messageContextMenusFoldersPath) : [];

        for(let folder of messageContextMenusFolders) {
            const messageContextMenusPath = path.join(messageContextMenusFoldersPath, folder);
            const messageContextMenuFiles = (fs.existsSync(messageContextMenusPath)) ? fs.readdirSync(messageContextMenusPath).filter(file => file.endsWith(".js")) : [];

            for(let messageContextMenu of messageContextMenuFiles) {
                const messageContextMenuFile = await import(`./messageContextMenus/${folder}/${messageContextMenu}`);
                client.messageContextMenus.set(messageContextMenuFile.messageContextMenu.data.name, messageContextMenuFile.messageContextMenu);
            }
        }

        // Create buttons collection
        client.buttons = new Collection();
        const buttons = (fs.existsSync(`./src/bot/buttons`)) ? fs.readdirSync(`./src/bot/buttons`).filter(file => file.endsWith(`.js`)) : [];
        for(let button of buttons){
            const buttonFile = await import(`./buttons/${button}`);
            client.buttons.set(button.split(".")[0], buttonFile.button);
        }

        // Create modals collection
        client.modals = new Collection();
        const modals = (fs.existsSync(`./src/bot/modals`)) ? fs.readdirSync(`./src/bot/modals`).filter(file => file.endsWith(`.js`)) : [];
        for(let modal of modals){
            const modalFile = await import(`./modals/${modal}`);
            client.modals.set(modal.split(".")[0], modalFile.modal);
        }

        // Create autocompletes collection
        client.autocompletes = new Collection();
        const autocompletes = (fs.existsSync(`./src/bot/autocompletes`)) ? fs.readdirSync(`./src/bot/autocompletes`).filter(file => file.endsWith(`.js`)) : [];
        for(let autocomplete of autocompletes){
            const autocompleteFile = await import(`./autocompletes/${autocomplete}`);
            client.autocompletes.set(autocomplete.split(".")[0], autocompleteFile.autocomplete);
        }

        // Create select menus collection
        client.selectMenus = new Collection();
        const selectMenus = (fs.existsSync(`./src/bot/selectMenus`)) ? fs.readdirSync(`./src/bot/selectMenus`).filter(file => file.endsWith(`.js`)) : [];
        for(let selectMenu of selectMenus){
            const selectMenuFile = await import(`./selectMenus/${selectMenu}`);
            client.selectMenus.set(selectMenu.split(".")[0], selectMenuFile.selectMenu);
        }

        // Read events
        const events = fs.readdirSync("./src/bot/events").filter(file => file.endsWith(".js"));
        for(let event of events){
            const eventFile = await import(`./events/${event}`);
            if(eventFile.event.once){
                client.once(eventFile.event.name, (...args) => {
                    eventFile.event.execute(...args);
                });
            } else {
                client.on(eventFile.event.name, (...args) => {
                    eventFile.event.execute(...args);
                });
            }
        }


        // Handle possible errors to prevent the bot to shut down when an error occurs
        client.on('error', (error) => {
            console.error('Erreur détectée:', error);
        });

        client.on('shardError', (error) => {
            console.error('Erreur de Shard:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Rejection non gérée à:', promise, 'raison:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('Exception non gérée:', error);
            process.exit(1); // Restart the bot if necessary
        });

        client.on('disconnect', () => {
            console.warn('Le bot a été déconnecté.');
        });

        client.on('reconnecting', () => {
            console.info('Le bot se reconnecte...');
        });

        // refresh commands
        await deploy.refreshArena();
        await deploy.refreshCommunity();

        // Login to discord
        await client.login(process.env.TOKEN);
    }
}