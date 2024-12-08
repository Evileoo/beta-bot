import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../../globals.js';
import { lApi } from '../../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        const roles = {
            top: parseInt(buttonData[2].substring(0,1)),
            jgl: parseInt(buttonData[2].substring(1,2)),
            mid: parseInt(buttonData[2].substring(2,3)),
            bot: parseInt(buttonData[2].substring(3,4)),
            sup: parseInt(buttonData[2].substring(4,5))
        }
        
        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        const dmy = inhouse[0].date_start.split("/");
        const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

        // Update database
        if(buttonData[1] == "false") {
            await db.query(`INSERT INTO inhouse_participant (discord_id, inhouse_id, is_toplaner, is_jungler, is_midlaner, is_botlaner, is_support) VALUES ('${interaction.user.id}', ${inhouse[0].id}, ${roles.top}, ${roles.jgl}, ${roles.mid}, ${roles.bot}, ${roles.sup})`);
        } else {
            await db.query(`UPDATE inhouse_participant SET is_toplaner = ${roles.top}, is_jungler = ${roles.jgl}, is_midlaner = ${roles.mid}, is_botlaner = ${roles.bot}, is_support = ${roles.sup} WHERE inhouse_id = ${inhouse[0].id} AND discord_id = '${interaction.user.id}'`);
        }

        // Get inhouse data
        const participants = await db.query(`SELECT COUNT(*) AS "all" FROM inhouse_participant WHERE inhouse_id = ${inhouse[0].id} AND discord_id = '${interaction.user.id}'`);
        const role = await db.query(`SELECT IFNULL(SUM(IF(is_toplaner > 0, 1, 0)), 0) AS "top", IFNULL(SUM(IF(is_jungler > 0, 1, 0)), 0) AS "jgl", IFNULL(SUM(IF(is_midlaner > 0, 1, 0)), 0) AS "mid", IFNULL(SUM(IF(is_botlaner > 0, 1, 0)), 0) AS "bot", IFNULL(SUM(IF(is_support > 0, 1, 0)), 0) AS "sup" FROM inhouse_participant WHERE inhouse_id = ${inhouse[0].id}`);

        // Update session message
        const panelChannel = await interaction.guild.channels.fetch(inhouse[0].panel_channel);
        const panelMessage = await panelChannel.messages.fetch(inhouse[0].panel_message);

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

        const sessionNextStep = new ButtonBuilder()
        .setCustomId(`inhouseRegistrationClose`)
        .setLabel(`Clôturer les inscriptions`)
        .setStyle(ButtonStyle.Success)
        .setDisabled((+participants[0].all >= 10) ? false : true);

        const sessionCommands = new ButtonBuilder()
        .setCustomId(`inhouseCommands${globals.separator}Inscriptions`)
        .setLabel(`Commandes`)
        .setStyle(ButtonStyle.Secondary);

        const inhouseStop = new ButtonBuilder()
        .setCustomId(`inhouseStop${globals.separator}first`)
        .setLabel(`Annuler l'InHouse`)
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
        .addComponents(sessionNextStep, sessionCommands, inhouseStop);

        await panelMessage.edit({
            embeds: [panelEmbed],
            components: [row]
        });

        // Update registration message
        const registrationChannel = interaction.guild.channels.cache.get(inhouse[0].register_channel);
        const registrationMessage = await registrationChannel.messages.fetch(inhouse[0].register_message);
        const registrationEmbed = registrationMessage.embeds[0];

        registrationEmbed.fields[1].value = participants[0].all;

        await registrationMessage.edit({
            embeds: [registrationEmbed]
        });

        // Prepare inhouse roles confirmation message
        let mainRole, secondRoles = "";
        let mainMessage;

        message(roles.top, "toplaner");
        message(roles.jgl, "jungler");
        message(roles.mid, "midlaner");
        message(roles.bot, "adc");
        message(roles.sup, "support");

        function message(priority, role) {
            if(priority == 1) {
                secondRoles += (secondRoles.length == 0) ? `**${role}**` : `, **${role}**`
            } else if(priority == 2) {
                mainRole = `**${role}**`;
            }
        }

        mainMessage = `Vous êtes inscrits à l'inhouse en tant que ${mainRole}.`;

        if(secondRoles.length > 0) {
            mainMessage += `\n`;
            if(secondRoles.includes(`,`)) {
                mainMessage += `Les roles ${secondRoles} pourront vous être donnés s'il manque des joueurs à ces postes.`
            } else {
                mainMessage += `Le role ${secondRoles} pourra vous être donné s'il manque des joueurs à ce poste`
            }
        }

        await interaction.update({
            content: `${mainMessage}`,
            embeds: [],
            components: [],
            ephemeral: true
        });

    }
}