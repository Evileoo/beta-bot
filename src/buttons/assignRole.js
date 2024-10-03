import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';
import { defineRoles } from '../functions/defineRoles.js'

export const button = {
    async execute(interaction, buttonData) {

        // Update roles
        await defineRoles.updateRoles(interaction, buttonData[1]);

        // Display the embed
        await defineRoles.updateEmbed(interaction, true);

        
    }
}