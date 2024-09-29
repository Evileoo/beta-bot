import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const modal = {
    async execute(interaction, modalData){
        // Get the user input
        const message = interaction.fields.getTextInputValue("modalExample");

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
}