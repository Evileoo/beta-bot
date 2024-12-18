import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import { db } from '../../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {        
        
        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);
        const participants = await db.query(`SELECT COUNT(*) AS "all" FROM inhouse_participant WHERE inhouse_id = ${inhouse[0].id} AND discord_id = '${interaction.user.id}'`);

        const dmy = inhouse[0].date_start.split("/");
        const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

        await db.query(`UPDATE inhouse_session SET step = 'Génération' ORDER BY id DESC LIMIT 1`);

        // Modifier le message des inscriptions
        const registerChannel = interaction.guild.channels.cache.get(inhouse[0].register_channel);
        const registerMessage = await registerChannel.messages.fetch(inhouse[0].register_message);

        const registerEmbed = new EmbedBuilder()
        .setTitle(`Inscriptions In House`)
        .setDescription(`Les inscriptions sont terminées.\nL'équipe s'occupe de créer les matchs`)
        .setColor(globals.embed.colorMain)
        .setTimestamp()
        .addFields(
            { name: `Date`, value: `<t:${dateTimeDiscord}:D>`, inline: true },
            { name: `Nombre d'inscrits`, value: `${participants[0].all}`, inline: true },
        );

        await registerMessage.edit({
            embeds: [registerEmbed],
            components: []
        });

        // Modifier le message de session
        const sessionChannel = interaction.guild.channels.cache.get(inhouse[0].panel_channel);
        const sessionMessage = await sessionChannel.messages.fetch(inhouse[0].panel_message);

        const sessionEmbed = new EmbedBuilder()
        .setTitle(`In House communautaire n°${inhouse[0].id}`)
        .setDescription(`Etapes:\nCréation\nInscriptions\n**__Génération des équipes__**\nRésultats des matchs\nChoix des MVP\nVote du MVP\nClôture`)
        .setTimestamp()
        .setColor(globals.embed.colorMain)
        .addFields(
            { name: `Date`, value: `<t:${dateTimeDiscord}:D>`, inline: true },
            { name: `Nombre d'inscrits`, value: `${participants[0].all}`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Nombre d'équipes`, value: `0`, inline: true },
            { name: `Nombre de matchs`, value: `0`, inline: true },
        );

        const sessionNextStep = new ButtonBuilder()
        .setCustomId(`inhouseConfirmMatches`)
        .setLabel(`Confirmer les matchs`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

        const sessionRegisteredPlayers = new ButtonBuilder()
        .setCustomId(`inhousePlayerList`)
        .setLabel(`Liste des inscrits`)
        .setStyle(ButtonStyle.Primary);

        const sessionCommands = new ButtonBuilder()
        .setCustomId(`inhouseCommands${globals.separator}Génération`)
        .setLabel(`Commandes`)
        .setStyle(ButtonStyle.Secondary);

        const inhouseStop = new ButtonBuilder()
        .setCustomId(`inhouseStop${globals.separator}first`)
        .setLabel(`Annuler l'InHouse`)
        .setStyle(ButtonStyle.Danger);

        const sessionRow = new ActionRowBuilder()
        .addComponents(sessionNextStep, sessionRegisteredPlayers, sessionCommands, inhouseStop);

        await sessionMessage.edit({
            embeds: [sessionEmbed],
            components: [sessionRow]
        });

        await interaction.deferUpdate();
    }
}