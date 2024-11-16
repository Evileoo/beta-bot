import {  } from 'discord.js';
import { globals } from '../globals.js';

export const button = {
    async execute(interaction, buttonData) {

        return await interaction.reply({
            content: `inhouse registration`,
            ephemeral: true
        });
    }
}