import {  } from 'discord.js';
import { globals } from '../../globals.js';
import { db } from '../connections/database.js';
import { inhouseRoles } from '../functions/defineRoles.js';

export const button = {
    async execute(interaction, buttonData) {

        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        //Check if the member is already registered
        const registered = await db.query(`SELECT * FROM inhouse_participant WHERE discord_id = '${interaction.user.id}' AND inhouse_id = ${inhouse[0].id}`);

        if(registered.length == 0) {
            return await interaction.reply({
                content: `Vous n'êtes pas inscrit à l'inhouse`,
                ephemeral: true
            });
        }

        // Build user roles
        const roles = {
            top: registered[0].is_toplaner,
            jgl: registered[0].is_jungler,
            mid: registered[0].is_midlaner,
            bot: registered[0].is_botlaner,
            sup: registered[0].is_support
        }

        
        // Display the embed role selection message
        const content = await inhouseRoles.message(roles, true);

        await interaction.reply({
            embeds: [content.embeds[0]],
            components: [content.components[0], content.components[1]],
            ephemeral: true
        });
    }
}