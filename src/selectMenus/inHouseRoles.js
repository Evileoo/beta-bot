import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionResponse } from 'discord.js';

export const selectMenu = {
    async execute(interaction, selectMenuData){
        // Get the user input
        console.log(interaction.values);

        let message = interaction.values.map(fruit => fruit).join(", ");

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
}