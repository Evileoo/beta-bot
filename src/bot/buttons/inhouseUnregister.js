import { EmbedBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import { db } from '../../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        //Check if the member is already registered
        const registered = await db.query(`SELECT * FROM inhouse_participant WHERE discord_id = '${interaction.user.id}' AND inhouse_id = ${inhouse[0].id}`);

        if(registered.length == 0) {
            return await interaction.reply({
                content: `Vous n'êtes pas inscrit à l'inhouse`,
                ephemeral: true
            });
        }

        // Delete the user from the inhouse
        await db.query(`DELETE FROM inhouse_participant WHERE inhouse_id = (SELECT id FROM inhouse_session ORDER BY id DESC LIMIT 1) AND discord_id = '${interaction.user.id}'`);

        // Get inhouse data
        const participants = await db.query(`SELECT COUNT(*) AS "all" FROM inhouse_participant WHERE inhouse_id = ${inhouse[0].id} AND discord_id = '${interaction.user.id}'`);
        const role = await db.query(`SELECT IFNULL(SUM(IF(is_toplaner > 0, 1, 0)), 0) AS "top", IFNULL(SUM(IF(is_jungler > 0, 1, 0)), 0) AS "jgl", IFNULL(SUM(IF(is_midlaner > 0, 1, 0)), 0) AS "mid", IFNULL(SUM(IF(is_botlaner > 0, 1, 0)), 0) AS "bot", IFNULL(SUM(IF(is_support > 0, 1, 0)), 0) AS "sup" FROM inhouse_participant WHERE inhouse_id = ${inhouse[0].id}`);

        const dmy = inhouse[0].date_start.split("/");
        const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

        // Update session message
        const panelChannel = await interaction.guild.channels.fetch(inhouse[0].panel_channel);
        const panelMessage = await panelChannel.messages.fetch(inhouse[0].panel_message);
        const panelButtons = panelMessage.components[0];

        // update the embed
        const panelEmbed = new EmbedBuilder()
        .setTitle(`In House communautaire n°${inhouse[0].id}`)
        .setDescription(`Etapes:\nCréation\n**__Inscriptions__**\nGénération des équipes\nRésultats des matchs\nChoix des MVP\nVote du MVP\nClôture`)
        .setTimestamp()
        .setColor(globals.embed.colorMain)
        .addFields(
            { name: `Date`, value: `<t:${dateTimeDiscord}:D>`, inline: true },
            { name: `Nombre d'inscrits`, value: `${participants[0].all}`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Rang minimum requis`, value: `${inhouse[0].elomin}`, inline: true },
            { name: `Rang maximum requis`, value: `${inhouse[0].elomax}`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Top`, value: `${role[0].top}`, inline: true },
            { name: `Jgl`, value: `${role[0].jgl}`, inline: true },
            { name: `Mid`, value: `${role[0].mid}`, inline: true },
            { name: `Bot`, value: `${role[0].bot}`, inline: true },
            { name: `Sup`, value: `${role[0].sup}`, inline: true },
        );

        // update button
        if(+participants[0].all < 10) {
            panelButtons.components[0].data.disabled = true;
        }

        await panelMessage.edit({
            embeds: [panelEmbed],
            components: [panelButtons]
        });

        // Update registration message
        const registrationChannel = interaction.guild.channels.cache.get(inhouse[0].register_channel);
        const registrationMessage = await registrationChannel.messages.fetch(inhouse[0].register_message);
        const registrationEmbed = registrationMessage.embeds[0];

        registrationEmbed.fields[1].value = participants[0].all;

        await registrationMessage.edit({
            embeds: [registrationEmbed]
        });

        // Reply
        await interaction.reply({
            content: `Vous avez été désinscrit de l'inhouse`,
            ephemeral: true
        });
        
    }
}