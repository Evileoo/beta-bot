import {  } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {
        await db.query(`DELETE FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        await interaction.reply({
            content: `La lisaison a bien été supprimée`,
            ephemeral: true
        });
    }
}