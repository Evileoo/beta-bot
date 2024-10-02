import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get the verification profile picture
        const profileImageId = buttonData[1];

        // Check if the lol account has the right profile image
        let account;
        try {
            const result = await db.query(`SELECT riot_puuid FROM comptes WHERE discord_id = '${interaction.user.id}' AND link_status <> 'linked'`);
            account = (await lApi.Summoner.getByPUUID(result[0].riot_puuid, Constants.Regions.EU_WEST)).response;
        } catch(error) {
            console.error(error);
            
            return await interaction.reply({
                content: `Une erreur s'est produite, réessayez\nSi l'erreur persiste prévenez ${globals.developer.discord.globalName}`,
                ephemeral: true
            });
        }

        if(account.profileIconId != profileImageId) {
            return await interaction.reply({
                content: `L'image de votre compte n'est pas la bonne.\nSi vous avez mis la bonne attendez un peu`,
                ephemeral: true
            });
        }

        // Update database
        await db.query(`UPDATE comptes SET link_status = 'linked' WHERE discord_id = '${interaction.user.id}'`);

        // Build the embed
        const embed = new EmbedBuilder()
        .setTitle("Choix du/des roles")
        .setDescription("Veuillez définir votre priorité de roles pour les inhouse.\nCliquez une fois sur un bouton pour le mettre en role secondaire, et une deuxième fois pour le mettre en role prioritaire")
        .setColor(globals.embed.colorMain)
        .setTimestamp()
        .addFields(
            { name: `Roles prioritaires`, value: ` ` },
            { name: `Roles secondaires`, value: ` ` },
            { name: `Roles non voulus`, value: `Toplaner, Jungler, Midlaner, ADC, Support` },
        );

        const bTop = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}toplaner`)
        .setLabel(`Toplaner`)
        .setStyle(ButtonStyle.Primary);

        const bJgl = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}jungler`)
        .setLabel(`Jungler`)
        .setStyle(ButtonStyle.Primary);

        const bMid = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}midlaner`)
        .setLabel(`Midlaner`)
        .setStyle(ButtonStyle.Primary);

        const bAdc = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}adc`)
        .setLabel(`AD Carry`)
        .setStyle(ButtonStyle.Primary);

        const bSup = new ButtonBuilder()
        .setCustomId(`assignRole${globals.separator}support`)
        .setLabel(`Support`)
        .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
        .addComponents(bTop, bJgl, bMid, bAdc, bSup);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
}