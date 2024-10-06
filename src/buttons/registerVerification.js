import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        const exists = await db.query(`SELECT NULL FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        if(exists.length > 0) {
            return await interaction.reply({
                content: `Vous avez déjà terminé la vérification, veuillez rejeter tous les messages`,
                ephemeral: true
            });
        }

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
        .setCustomId(`verify${globals.separator}${profileImageId}${globals.separator}${buttonData[2]}${globals.separator}${buttonData[3]}`)
        .setLabel(`Vérifier`)
        .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
        .addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
}