import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get the verification profile picture
        const role = buttonData[1];

        // Get role priorities
        const priorities = await db.query(`SELECT toplaner_priority, jungler_priority, midlaner_priority, botlaner_priority, support_priority FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        switch(role) {
            case "toplaner":
                if(priorities[0].toplaner_priority < 2) await db.query(`UPDATE comptes SET toplaner_priority = ${parseInt(priorities[0].toplaner_priority) + 1} WHERE discord_id = '${interaction.user.id}'`);
                else await db.query(`UPDATE comptes SET toplaner_priority = 0 WHERE discord_id = '${interaction.user.id}'`);
                break;
            case "jungler":
                if(priorities[0].jungler_priority < 2) await db.query(`UPDATE comptes SET jungler_priority = ${parseInt(priorities[0].jungler_priority) + 1} WHERE discord_id = '${interaction.user.id}'`);
                else await db.query(`UPDATE comptes SET jungler_priority = 0 WHERE discord_id = '${interaction.user.id}'`);
                break;
            case "midlaner":
                if(priorities[0].midlaner_priority < 2) await db.query(`UPDATE comptes SET midlaner_priority = ${parseInt(priorities[0].midlaner_priority) + 1} WHERE discord_id = '${interaction.user.id}'`);
                else await db.query(`UPDATE comptes SET midlaner_priority = 0 WHERE discord_id = '${interaction.user.id}'`);
                break;
            case "botlaner":
                if(priorities[0].botlaner_priority < 2) await db.query(`UPDATE comptes SET botlaner_priority = ${parseInt(priorities[0].botlaner_priority) + 1} WHERE discord_id = '${interaction.user.id}'`);
                else await db.query(`UPDATE comptes SET botlaner_priority = 0 WHERE discord_id = '${interaction.user.id}'`);
                break;
            case "support":
                if(priorities[0].support_priority < 2) await db.query(`UPDATE comptes SET support_priority = ${parseInt(priorities[0].support_priority) + 1} WHERE discord_id = '${interaction.user.id}'`);
                else await db.query(`UPDATE comptes SET support_priority = 0 WHERE discord_id = '${interaction.user.id}'`);
                break;
            default :
                return await interaction.reply({
                    content: `Erreur lors de l'assignement du role, merci de prévenir ${globals.developer.discord.globalName}`,
                    ephemeral: true
                });
        }

        const newPriorities = await db.query(`SELECT toplaner_priority, jungler_priority, midlaner_priority, botlaner_priority, support_priority FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        console.log(newPriorities[0]);

        let highPriorityMessage = "";
        let lowPriorityMessage = "";
        let noPriorityMessage = "";

        priorityMessages(newPriorities[0].toplaner_priority, "toplaner");
        priorityMessages(newPriorities[0].jungler_priority, "jungler");
        priorityMessages(newPriorities[0].midlaner_priority, "midlaner");
        priorityMessages(newPriorities[0].botlaner_priority, "AD carry");
        priorityMessages(newPriorities[0].support_priority, "support");

        function priorityMessages(priority, role) {
            switch(priority) {
                case "0":
                    noPriorityMessage += (noPriorityMessage ? ", ": "") + role;
                    break;
                case "1":
                    lowPriorityMessage += (lowPriorityMessage ? ", ": "") + role;
                    break;
                case "2":
                    highPriorityMessage += (highPriorityMessage ? ", ": "") + role;
                    break;
            }
        }

        // Build the embed
        const embed = new EmbedBuilder()
        .setTitle("Choix du/des roles")
        .setDescription("Veuillez définir votre priorité de roles pour les inhouse.\nCliquez une fois sur un bouton pour le mettre en role secondaire, et une deuxième fois pour le mettre en role prioritaire")
        .setColor(globals.embed.colorMain)
        .setTimestamp()
        .addFields(
            { name: `Roles prioritaires`, value: (highPriorityMessage == "") ? " " : highPriorityMessage },
            { name: `Roles secondaires`, value: (lowPriorityMessage == "") ? " " : lowPriorityMessage },
            { name: `Roles non voulus`, value: (noPriorityMessage == "") ? " " : noPriorityMessage },
        );

        const bTop = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}toplaner`)
        .setLabel(`Toplaner`)
        .setStyle(ButtonStyle.Primary);

        const bJgl = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}jungler`)
        .setLabel(`Jungler`)
        .setStyle(ButtonStyle.Primary);

        const bMid = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}midlaner`)
        .setLabel(`Midlaner`)
        .setStyle(ButtonStyle.Primary);

        const bAdc = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}adc`)
        .setLabel(`AD Carry`)
        .setStyle(ButtonStyle.Primary);

        const bSup = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}support`)
        .setLabel(`Support`)
        .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
        .addComponents(bTop, bJgl, bMid, bAdc, bSup);

        await interaction.update({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
}