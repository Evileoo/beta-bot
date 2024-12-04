import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../../globals.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get the verification profile picture
        const profileImageId = (buttonData[1] != 10) ? 10 : 1;

        // Build the embed
        const embed = new EmbedBuilder()
        .setTitle("Vérification")
        .setDescription("Veuillez mettre l'image affichée ici en image de profil de votre compte LoL.\nCliquez ensuite sur `Vérifier`.\n\nVous pourrez la changer de nouveau après la vérification.")
        .setColor(globals.embed.colorMain)
        .setTimestamp()
        .setImage(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileImageId}.jpg`);

        const button = new ButtonBuilder()
        .setCustomId(`compteVerification2${globals.separator}${profileImageId}${globals.separator}${buttonData[2]}${globals.separator}${buttonData[3]}`)
        .setLabel(`Vérifier`)
        .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
        .addComponents(button);

        await interaction.update({
            embeds: [embed],
            components: [row],
            files: [],
            ephemeral: true
        });
    }
}