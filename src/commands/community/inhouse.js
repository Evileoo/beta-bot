import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../../connections/database.js';
import { lApi } from '../../connections/lolapi.js';
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
            .setDescription("Exemple: 31/12/2023 17h")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("elomin")
            .setDescription("Rang minimum pour participer")
            .setRequired(false)
            .addChoices(
                {name: `Non classé`, value: `Non classé${globals.separator}UNRANKED`},
                {name: `Bronze`, value: `Bronze${globals.separator}BRONZE`},
                {name: `Argent`, value: `Argent${globals.separator}SILVER`},
                {name: `Or`, value: `Or${globals.separator}GOLD`},
                {name: `Platine`, value: `Platine${globals.separator}PLATINUM`},
                {name: `Émeraude`, value: `Émeraude${globals.separator}EMERALD`},
                {name: `Diamant`, value: `Diamant${globals.separator}DIAMOND`},
                {name: `Maître`, value: `Maître${globals.separator}MASTER`},
                {name: `Grand Maître`, value: `Grand Maître${globals.separator}GRANDMASTER`},
                {name: `Challenger`, value: `Challenger${globals.separator}CHALLENGER`},
            )
        )
        .addStringOption( (option) =>
            option
            .setName("elomax")
            .setDescription("Rang maximum pour participer")
            .setRequired(false)
            .addChoices(
                {name: `Non classé`, value: `Non classé${globals.separator}UNRANKED`},
                {name: `Bronze`, value: `Bronze${globals.separator}BRONZE`},
                {name: `Argent`, value: `Argent${globals.separator}SILVER`},
                {name: `Or`, value: `Or${globals.separator}GOLD`},
                {name: `Platine`, value: `Platine${globals.separator}PLATINUM`},
                {name: `Émeraude`, value: `Émeraude${globals.separator}EMERALD`},
                {name: `Diamant`, value: `Diamant${globals.separator}DIAMOND`},
                {name: `Maître`, value: `Maître${globals.separator}MASTER`},
                {name: `Grand Maître`, value: `Grand Maître${globals.separator}GRANDMASTER`},
                {name: `Challenger`, value: `Challenger${globals.separator}CHALLENGER`},
            )
        )
        .addIntegerOption( (option) =>
            option
            .setName("rolelimite")
            .setDescription("Limite de joueurs par role")
            .setRequired(false)
        )
        .addChannelOption( (option) =>
            option
            .setName("inscriptions")
            .setDescription("Salon des inscriptions")
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

        } else {
            return await interaction.reply({
                content: `Commande non gérée, merci de contacter ${globals.developer.discord.globalName} et de donner la commande que vous avez essayé`,
                ephemeral: true
            });
        }
    }
}