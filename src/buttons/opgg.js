import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { globals } from '../globals.js';

export const button = {
    async execute(interaction, buttonData) {

        const modal = new ModalBuilder()
        .setCustomId(`${buttonData[0]}${globals.separator}${buttonData[1]}`)
        .setTitle("opgg de l'équipe adverse");

        const opgg = new TextInputBuilder()
        .setCustomId("link")
        .setLabel("Lien de l'opgg")
        .setStyle(TextInputStyle.Paragraph)

        const row = new ActionRowBuilder()
        .addComponents(opgg);

        modal.addComponents(row);

        await interaction.showModal(modal);
    }
}