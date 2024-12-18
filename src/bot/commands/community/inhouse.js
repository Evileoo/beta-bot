import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../../../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../../../connections/database.js';
import { lApi } from '../../../connections/lolapi.js';
import { Constants } from 'twisted';

export const command = {
    data: new SlashCommandBuilder()
    .setName("inhouse")
    .setDescription("Gestion des inhouse")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("session")
        .setDescription("Crée une session inhouse")
        .addChannelOption( (option) =>
            option
            .setName("channel")
            .setDescription("Channel de gestion de l'inhouse")
            .setRequired(true)
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("paramétrage")
        .setDescription("Édite les paramètres de la session")
        .addStringOption( (option) =>
            option
            .setName("date")
            .setDescription("Exemple: 31/12/2023")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("elomin")
            .setDescription("Rang minimum pour participer")
            .setRequired(false)
            .addChoices(
                {name: `Non classé`, value: `${globals.lol.tier[0]}`},
                {name: `Fer`, value: `${globals.lol.tier[1]}`},
                {name: `Bronze`, value: `${globals.lol.tier[2]}`},
                {name: `Argent`, value: `${globals.lol.tier[3]}`},
                {name: `Or`, value: `${globals.lol.tier[4]}`},
                {name: `Platine`, value: `${globals.lol.tier[5]}`},
                {name: `Émeraude`, value: `${globals.lol.tier[6]}`},
                {name: `Diamant`, value: `${globals.lol.tier[7]}`},
                {name: `Maître`, value: `${globals.lol.tier[8]}`},
                {name: `Grand Maître`, value: `${globals.lol.tier[9]}`},
                {name: `Challenger`, value: `${globals.lol.tier[10]}`},
            )
        )
        .addStringOption( (option) =>
            option
            .setName("elomax")
            .setDescription("Rang maximum pour participer")
            .setRequired(false)
            .addChoices(
                {name: `Non classé`, value: `${globals.lol.tier[0]}`},
                {name: `Fer`, value: `${globals.lol.tier[1]}`},
                {name: `Bronze`, value: `${globals.lol.tier[2]}`},
                {name: `Argent`, value: `${globals.lol.tier[3]}`},
                {name: `Or`, value: `${globals.lol.tier[4]}`},
                {name: `Platine`, value: `${globals.lol.tier[5]}`},
                {name: `Émeraude`, value: `${globals.lol.tier[6]}`},
                {name: `Diamant`, value: `${globals.lol.tier[7]}`},
                {name: `Maître`, value: `${globals.lol.tier[8]}`},
                {name: `Grand Maître`, value: `${globals.lol.tier[9]}`},
                {name: `Challenger`, value: `${globals.lol.tier[10]}`},
            )
        )
        .addStringOption( (option) =>
            option
            .setName("rolemax")
            .setDescription("Limite de joueurs par role")
            .setRequired(false)
        )
        .addChannelOption( (option) =>
            option
            .setName("salon")
            .setDescription("Salon des inscriptions")
            .setRequired(false)
        )
    )
    .addSubcommand( subcommand => 
        subcommand
        .setName("match")
        .setDescription("crée un match d'inhouse")
        .addStringOption( option =>
            option
            .setName("équipe1")
            .setDescription("Identifiants des 5 joueurs de l'équipe 1")
            .setRequired(true)
        )
        .addStringOption( option =>
            option
            .setName("équipe2")
            .setDescription("Identifiants des 5 joueurs de l'équipe 2")
            .setRequired(true)
        )
        .addIntegerOption( option =>
            option
            .setName("ordre")
            .setDescription("Si le match se joue en 1er ou 5ème")
            .setRequired(true)
        )
        .addStringOption( option =>
            option
            .setName("noméquipe1")
            .setDescription("Nom de l'équipe 1")
            .setRequired(false)
        )
        .addStringOption( option =>
            option
            .setName("noméquipe2")
            .setDescription("Nom de l'équipe 2")
            .setRequired(false)
        )
        .addBooleanOption( option =>
            option
            .setName("streamé")
            .setDescription("Est-ce que le match est streamé ?")
            .setRequired(false)
        )
    )
    
    , async execute(interaction) {
        if(interaction.options.getSubcommand() == "session") {
            
            // Get command data
            const channel = interaction.options.getChannel("channel");

            // Check if the last inhouse is finished
            const lastInHouse = await db.query(`SELECT step FROM inhouse_session ORDER BY id DESC LIMIT 1`);
            if(lastInHouse.length > 0 && lastInHouse[0].step != "Terminé") {
                return await interaction.reply({
                    content: `Un InHouse est en cours, veuillez terminer l'actuel avant d'en commencer un nouveau`,
                    ephemeral: true
                });
            }

            await db.query(`INSERT INTO inhouse_session (step, panel_channel, players_per_role, elomin, elomax) VALUES ('Création', '${channel.id}', 0, '${globals.lol.tier[0]}', '${globals.lol.tier[globals.lol.tier.length - 1]}')`);

            const inHouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            const embed = new EmbedBuilder()
            .setTitle(`In House communautaire n°${inHouse[0].id}`)
            .setDescription(`Etapes:\n**__Création__**\nInscriptions\nGénération des équipes\nRésultats des matchs\nChoix des MVP\nVote du MVP\nClôture`)
            .setColor(globals.embed.colorMain)
            .setTimestamp()
            .addFields(
                {name: `Nombre de joueurs par role`, value: "Illimité", inline: true},
                {name: `Date`, value: "A définir", inline: true},
                {name: "\t", value: "\t", inline: false},
                {name: `Salon des inscriptions`, value: "A définir", inline: true},
                {name: "\t", value: "\t", inline: false},
                {name: `Rang minimum`, value: `${inHouse[0].elomin}`, inline: true},
                {name: `Rang maximum`, value: `${inHouse[0].elomax}`, inline: true},
            );

            const inHouseNextStep = new ButtonBuilder()
            .setCustomId(`inhouseRegistration`)
            .setLabel(`Démarrer les inscriptions`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)

            const inHouseCommands = new ButtonBuilder()
            .setCustomId(`inhouseCommands${globals.separator}${inHouse[0].step}`)
            .setLabel(`Commandes`)
            .setStyle(ButtonStyle.Secondary);

            const inHouseCancel = new ButtonBuilder()
            .setCustomId(`inhouseStop${globals.separator}first`)
            .setLabel(`Annuler l'InHouse`)
            .setStyle(ButtonStyle.Danger)

            const row1 = new ActionRowBuilder()
            .addComponents(inHouseNextStep, inHouseCommands, inHouseCancel);

            const message = await channel.send({
                embeds: [embed],
                components: [row1]
            });

            await db.query(`UPDATE inhouse_session SET panel_message = '${message.id}' ORDER BY id DESC LIMIT 1`);

            await interaction.reply({
                content: `Panel de l'inhouse créé dans le channel donné : <#${inHouse[0].panel_channel}>`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "paramétrage") {

            // Get command data
            const date = interaction.options.getString("date");
            const elomin = interaction.options.getString("elomin");
            const elomax = interaction.options.getString("elomax");
            const channel = interaction.options.getChannel("salon");
            const rolemax = interaction.options.getString("rolemax");

            if(!date && !elomin && !elomax && !channel && !rolemax) {
                return await interaction.reply({
                    content: `Veuillez choisir au moins une donnée à modifier`,
                    ephemeral: true
                });
            }

            // Get InHouse registered data
            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            if(inhouse[0].step != "Création") {
                return await interaction.reply({
                    content: `Vous ne pouvez pas modifier le paramétrage de l'InHouse une fois que les inscriptions ont commencé`,
                    ephemeral: true
                });
            }

            // Fetch panel message embed
            const panelChannel = interaction.guild.channels.cache.get(inhouse[0].panel_channel);
            const message = await panelChannel.messages.fetch(inhouse[0].panel_message);
            const embed = message.embeds[0];

            // Update
            let queryUpdates = "";

            if(date) {
                // Format date
                const dmy = date.split("/");
                if(dmy.length != 3 && dmy[0].length != 2 && dmy[1].length != 2 && dmy[2].length != 4) {
                    return await interaction.reply({
                        content: `Le format de la date fournie est incorrect`,
                        ephemeral: true
                    });
                }
                const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

                embed.fields[1] = {name: embed.fields[1].name, value: `<t:${dateTimeDiscord}:D>`, inline: embed.fields[1].inline };
                queryUpdates += (queryUpdates ? ", ": "") + `date_start = '${date}'`;
            }

            if(elomin) {
                embed.fields[5] = { name: embed.fields[5].name, value: elomin, inline: embed.fields[5].inline };
                queryUpdates += (queryUpdates ? ", ": "") + `elomin = '${elomin}'`;
            }

            if(elomax) {
                embed.fields[6] = { name: embed.fields[6].name, value: elomax, inline: embed.fields[6].inline };
                queryUpdates += (queryUpdates ? ", ": "") + `elomax = '${elomax}'`;
            }

            if(channel) {
                embed.fields[3] = { name: embed.fields[3].name, value: `<#${channel.id}>`, inline: embed.fields[3].inline };
                queryUpdates += (queryUpdates ? ", ": "") + `register_channel = '${channel.id}'`;
            }

            if(rolemax) {
                embed.fields[0] = { name: embed.fields[0].name, value: `${(rolemax == 0) ? "Illimité" : rolemax}`, inline: embed.fields[0].inline };
                queryUpdates += (queryUpdates ? ", ": "") + `players_per_role = ${rolemax}`;
            }

            if(queryUpdates != "") {
                await db.query(`UPDATE inhouse_session SET ${queryUpdates} ORDER BY id DESC LIMIT 1`);
            }

            // Check if all required fields have been filled
            const required = await db.query(`SELECT date_start, register_channel FROM inhouse_session ORDER BY id DESC LIMIT 1`);
            if(required[0].date_start && required[0].register_channel) {
                message.components[0].components[0].data.disabled = false;
            }

            // Send the new message
            await message.edit({embeds: [embed], components: [message.components[0]]});

            await interaction.reply({
                content: `modifications effectuées`,
                ephemeral: true
            });
        
        } else if(interaction.options.getSubcommand() == "match") {

            // Get data
            const team1 = interaction.options.getString("équipe1").split(",");
            const team2 = interaction.options.getString("équipe2").split(",");
            const order = interaction.options.getInteger("ordre");
            const team1Name = interaction.options.getString("noméquipe1");
            const team2Name = interaction.options.getString("noméquipe2");
            const streamed = interaction.options.getBoolean("streamé");

            // If teams are not of the same size
            if(team1.length != team2.length) {
                return await interaction.reply({
                    content: `Un match ne peut pas être joué à ${team1.length} contre ${team2.length}`,
                    ephemeral: true
                });
            }

            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            // Checks
            for(let i = 0; i < team1.length; i++) {
                // team 1 member ID is unkown
                try {
                    const t1Member = await interaction.guild.members.fetch(team1[i]);
                } catch(error) {
                    return await interaction.reply({
                        content: `l'identifiant n°${i+1} fourni de la team 1 n'est pas bon`,
                        ephemeral: true
                    });
                }
                // team 2 member ID is unnkown
                try {
                    const t2Member = await interaction.guild.members.fetch(team2[i]);
                } catch(error) {
                    return await interaction.reply({
                        content: `l'identifiant n°${i+1} fourni de la team 2 n'est pas bon`,
                        ephemeral: true
                    });
                }
                // member appears in both teams
                if(team2.includes(team1[i])) {
                    return await interaction.reply({
                        content: `<@${team1[i]}> est dans les deux équipes`,
                        ephemeral: true
                    });
                }
                // member appears multiple times in the same team
                if(team1.filter((id) => (id == team1[i])).length > 1) {
                    return await interaction.reply({
                        content: `<@${team1[i]}> apparaît plusieurs fois dans l'équipe 1`,
                        ephemeral: true
                    });
                }
                if(team2.filter((id) => (id == team2[i])).length > 1) {
                    return await interaction.reply({
                        content: `<@${team2[i]}> apparaît plusieurs fois dans l'équipe 2`,
                        ephemeral: true
                    });
                }
            }

            await db.query(`INSERT INTO inhouse_match (inhouse_id, is_streamed, is_finished) VALUES (${inhouse[0].id}, ${(streamed) ? 1 : 0}, 0)`);

            const match = await db.query(`SELECT * FROM inhouse_match ORDER BY match_id DESC LIMIT 1`);

            await db.query(`
                INSERT INTO (match_id, inhouse_id, toplaner, jungler, midlaner, botlaner, support, team_name) VALUES 
                (${match[0].match_id}, ${inhouse[0].id}, ${team1[0]}, ${team1[1]}, ${team1[2]}, ${team1[3]}, ${team1[4]}, '${(team1Name) ? team1Name : "Équipe 1"}'), 
                (${match[0].match_id}, ${inhouse[0].id}, ${team2[0]}, ${team2[1]}, ${team2[2]}, ${team2[3]}, ${team2[4]}, '${(team2Name) ? team2Name : "Équipe 2"}')
            `);

            const embed = new EmbedBuilder()
            .setTitle(`Match n°${order}`)
            .setColor(globals.embed.colorMain)
            .setFields(
                { name: `${(team1Name) ? team1Name : "Équipe 1"}`, value: `<@${team1[0]}>\n<@${team1[1]}>\n<@${team1[2]}>\n<@${team1[3]}>\n<@${team1[4]}>`, inline: true },
                { name: `${(team2Name) ? team2Name : "Équipe 2"}`, value: `<@${team2[0]}>\n<@${team2[1]}>\n<@${team2[2]}>\n<@${team2[3]}>\n<@${team2[4]}>`, inline: true },
            )
            .setTimestamp();

            const cancel = new ButtonBuilder()
            .setCustomId(`inhouseTeamCancel${globals.separator}${match[0].match_id}`)
            .setLabel(`Supprimer l'équipe`)
            .setStyle(ButtonStyle.Danger);
            
            const row = new ActionRowBuilder()
            .addComponents(cancel);

            return await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });


        } else {
            return await interaction.reply({
                content: `Commande non gérée, merci de contacter ${globals.developer.discord.globalName} et de donner la commande que vous avez essayé`,
                ephemeral: true
            });
        }
    }
}