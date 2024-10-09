import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../connections/database.js'

export const command = {
    data: new SlashCommandBuilder()
    .setName("inhouse")
    .setDescription("Gestion des sessions inhouse")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand((subcommand) => 
        subcommand
        .setName("créer")
        .setDescription("Crée une sesssion inhouse")
        .addStringOption( (option) =>
            option
            .setName("date")
            .setDescription("Exemple: 31/12/2023")
            .setRequired(true)
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
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("modifier")
        .setDescription("Modifie une sesssion inhouse")
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
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("annuler")
        .setDescription("Annule l'inhouse en cours")
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("fininscriptions")
        .setDescription("Clos les inscriptions pour l'inhouse en cours")
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("remplacer")
        .setDescription("Remplace un joueur par un autre")
        .addUserOption( (option) =>
            option
            .setName("remplaçant")
            .setDescription("Joueur remplaçant")
            .setRequired(true)
        )
        .addUserOption( (option) =>
            option
            .setName("remplacé")
            .setDescription("Joueur remplacé")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("mvp")
        .setDescription("Définit le MVP du dernier inhouse")
    )
    , async execute(interaction){

        if(interaction.options.getSubcommand() == "créer") {

            // Get command data
            const date = interaction.options.getString("date");
            const elomin = (interaction.options.getString("elomin") == null) ? `Non classé${globals.separator}UNRANKED`.split(globals.separator) : interaction.options.getString("elomin").split(globals.separator);
            const elomax = (interaction.options.getString("elomax") == null) ? `Challenger${globals.separator}CHALLENGER`.split(globals.separator) : interaction.options.getString("elomax").split(globals.separator);
            const limit = interaction.options.getInteger("rolelimite");

            // Check if an other inhouse is unfinished
            const checkOtherInhouse = await db.query(`SELECT id FROM inhouse_session WHERE inhouse_status <> 'finished'`);

            if(checkOtherInhouse.length > 0) {
                return interaction.reply({
                    content: `L'inhouse n°${checkOtherInhouse[0].id} n'est pas terminé, un seul inhouse peut avoir lieu à la fois.`,
                    ephemeral: true
                });
            }
            
            // Get last id
            const lastInHouseId = await db.query(`SELECT id FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            if(lastInHouseId.length == 0) {
                lastInHouseId.push({
                    id: 0
                });
            }

            // Format date
            const dmy = date.split("/");
            const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

            // Format embed messages
            const limitMessage = (limit == null) ? `aucune` : limit;

            // Generate message
            const embed = new EmbedBuilder()
            .setTitle(`In House n°${parseInt(lastInHouseId[0].id) + 1}`)
            .setDescription(`Si vous ne vous êtes jamais enregistré sur le bot, veuillez faire la commande \`/compte enregistrer\` avant de vous inscrire\nSi vous êtes inscrits et que vous souhaitez changer vos roles, désinscrivez-vous et réinscrivez vous en cliquant sur \`S'inscrire avec des nouveaux roles\``)
            .addFields(
                { name: `Date`, value: `<t:${dateTimeDiscord}:D>`},
                { name: `Rang minimum`, value: elomin[0], inline: true },
                { name: `Rang maximum`, value: elomax[0], inline: true },
                { name: `Limite de joueurs par role`, value: `${limitMessage}` },
                { name: `Nombre de joueurs inscrits`, value: `0` },
            )
            .setColor(globals.embed.colorMain)
            .setTimestamp();

            const newRoles = new ButtonBuilder()
            .setCustomId(`inhouseroles${globals.separator}new${globals.separator}${parseInt(lastInHouseId[0].id) + 1}`)
            .setLabel(`S'inscrire avec des nouveaux roles`)
            .setStyle(ButtonStyle.Primary);

            const oldRoles = new ButtonBuilder()
            .setCustomId(`inhouseroles${globals.separator}old${globals.separator}${parseInt(lastInHouseId[0].id) + 1}`)
            .setLabel(`S'inscrire en conservant ses derniers roles`)
            .setStyle(ButtonStyle.Secondary);

            const unregister = new ButtonBuilder()
            .setCustomId(`inhouseunregister${globals.separator}${parseInt(lastInHouseId[0].id) + 1}`)
            .setLabel(`Se désinscrire`)
            .setStyle(ButtonStyle.Danger);

            const row1 = new ActionRowBuilder()
            .addComponents(newRoles, oldRoles);

            const row2 = new ActionRowBuilder()
            .addComponents(unregister);

            // Send message
            await interaction.reply({
                embeds: [embed],
                components: [row1, row2],
            });

            // Update database
            interaction.channel.messages.fetch({ limit: 1 }).then(async (message) => {
                await db.query(`INSERT INTO inhouse_session (tms, elomin, elomax, role_limit, guild_id, channel_id, message_id, inhouse_status) VALUES ('${date}', '${elomin[1]}', '${elomax[1]}', ${limit}, '${interaction.guild.id}', '${interaction.channel.id}', '${message.first().id}', 'creation')`);
            });
        } else if(interaction.options.getSubcommand() == "modifier") {

            // Get command data
            const date = interaction.options.getString("date");
            const elomin = interaction.options.getString("elomin");
            const elomax = interaction.options.getString("elomax");
            const limit = interaction.options.getInteger("rolelimite");

            if(!date && !elomin && !elomax && !limit) {
                return await interaction.reply({
                    content: `Veuillez choisir au moins une donnée de l'inhouse à modifier`,
                    ephemeral: true
                });
            }

            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            // Find the message
            const channel = await interaction.client.channels.fetch(inhouse[0].channel_id);
            const message = await channel.messages.fetch(inhouse[0].message_id);
            
            const embed = message.embeds[0];

            // Update the database and the message content

            let queryUpdates = "";

            if(date != null) {
                // Format date
                const dmy = date.split("/");
                const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

                embed.fields[0] = { name: embed.fields[0].name, value: `<t:${dateTimeDiscord}:D>`, inline: embed.fields[0].inline };

                queryUpdates += (queryUpdates ? ", ": "") + `tms = '${date}'`;
            }

            if(elomin != null) {
                const splitted = elomin.split(globals.separator);

                embed.fields[1] = { name: embed.fields[1].name, value: splitted[0], inline: embed.fields[1].inline };

                queryUpdates += (queryUpdates ? ", ": "") + `elomin = '${splitted[1]}'`;
            }

            if(elomax != null) {
                const splitted = elomax.split(globals.separator);

                embed.fields[2] = { name: embed.fields[2].name, value: splitted[0], inline: embed.fields[2].inline };

                queryUpdates += (queryUpdates ? ", ": "") + `elomax = '${splitted[1]}'`;
            }

            if(limit != null) {
                embed.fields[3] = { name: embed.fields[3].name, value: `${limit}`, inline: embed.fields[3].inline };

                queryUpdates += (queryUpdates ? ", ": "") + `role_limit = ${limit}`;
            }

            if(queryUpdates != "") {
                await db.query(`UPDATE inhouse_session SET ${queryUpdates} ORDER BY id DESC LIMIT 1`);
            }


            // Send the new message
            await message.edit({embeds: [embed]});

            await interaction.reply({
                content: `modifications effectuées`,
                ephemeral: true
            });


        } else if(interaction.options.getSubcommand() == "annuler") {

        } else if(interaction.options.getSubcommand() == "fininscriptions") {

        } else if(interaction.options.getSubcommand() == "remplacer") {

        } else if(interaction.options.getSubcommand() == "mvp") {

        } else {
            
        }
    }
}