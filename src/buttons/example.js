import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const button = {
    async execute(interaction, buttonData) {

        const modal = new ModalBuilder()
        .setCustomId(`${buttonData[0]}`)
        .setTitle("Modal example");

        const example = new TextInputBuilder()
        .setCustomId("modalExample")
        .setLabel("Write something")
        .setStyle(TextInputStyle.Short)

        const row = new ActionRowBuilder()
        .addComponents(example);

        modal.addComponents(row);

        await interaction.showModal(modal);
    }
}