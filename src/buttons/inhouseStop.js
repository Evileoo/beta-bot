import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionResponse } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        if(buttonData[1] == "first") {
            const confirmStop = new ButtonBuilder()
            .setCustomId(`inhouseStop${globals.separator}second`)
            .setLabel(`oui`)
            .setStyle(ButtonStyle.Danger)

            const row = new ActionRowBuilder()
            .addComponents(confirmStop);

            await interaction.reply({
                content: `Mettre fin à l'InHouse arrêtera définitivement toutes les actions concernant cet In House\nÊtes-vous sûr de vouloir y mettre fin ?`,
                components: [row],
                ephemeral: true
            });
        } else {
            await db.query(`UPDATE inhouse_session SET step = 'Terminé' ORDER BY id DESC LIMIT 1`);

            const inhouse = await db.query(`SELECT panel_channel, panel_message FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            const channel = interaction.guild.channels.cache.get(inhouse[0].panel_channel);
            const message = await channel.messages.fetch(inhouse[0].panel_message);
            await message.delete();

            await interaction.update({
                content: `L'InHouse a été clôturé.`,
                components: [],
                ephemeral: true
            });
        }

        
    }
}