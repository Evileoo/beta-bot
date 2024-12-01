import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../../connections/database.js';
import { lApi } from '../../connections/lolapi.js';
import { Constants } from 'twisted';

export const command = {
    data: new SlashCommandBuilder()
    .setName("oldinhouse")
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
        .addStringOption( (option) =>
            option
            .setName("raison")
            .setDescription("Raison de l'annulation. Écrivez 0 pour faire une annulation sans laisser de message")
            .setRequired(true)
        )
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
        .addUserOption( (option) =>
            option
            .setName("membre")
            .setDescription("Membre du discord qui va obtenir le MVP")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("équipes")
        .setDescription("Génère les équipes de l'inhouse")
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

            const reason = interaction.options.getString("raison");

            // Check if there's an inhouse running
            const inhouse = await db.query(`SELECT * FROM inhouse_session WHERE inhouse_status <> 'finished' ORDER BY id DESC LIMIT 1`);

            if(inhouse.length == 0) {
                return await interaction.reply({
                    content: `Il n'y a aucun inhouse en cours`,
                    ephemeral: true
                });
            }

            // Find the message
            const channel = await interaction.client.channels.fetch(inhouse[0].channel_id);
            const message = await channel.messages.fetch(inhouse[0].message_id);
            
            const oldEmbed = message.embeds[0];

            // Build the new embed
            const embed = new EmbedBuilder()
            .setTitle(`${oldEmbed.title} annulé`)
            .setTimestamp()
            .setColor(globals.embed.colorError);

            if(reason != "0") {
                embed.setFields({ name: `Raison`, value: reason });
            } else {
                embed.setDescription(`Désolé du dérangement`);
            }

            // Finish the inhouse and remove participants
            await db.query(`UPDATE inhouse_session SET inhouse_status = 'finished' ORDER BY id DESC LIMIT 1`);
            await db.query(`DELETE FROM inhouse_participants WHERE inhouse_id = ${inhouse[0].id}`);

            // Edit the embed
            await message.edit({
                embeds: [embed],
                components: []
            });

            await interaction.reply({
                content: `inhouse annulé avec succès`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "fininscriptions") {

            // Check if there's an inhouse running
            const inhouse = await db.query(`SELECT * FROM inhouse_session WHERE inhouse_status <> 'finished' ORDER BY id DESC LIMIT 1`);

            if(inhouse.length == 0) {
                return await interaction.reply({
                    content: `Il n'y a aucun inhouse en cours`,
                    ephemeral: true
                });
            }

            // Close the inhouse
            await db.query(`UPDATE inhouse_session SET inhouse_status = 'finished' ORDER BY id DESC LIMIT 1`);

            // Find the message
            const channel = await interaction.client.channels.fetch(inhouse[0].channel_id);
            const message = await channel.messages.fetch(inhouse[0].message_id);
            
            const oldEmbed = message.embeds[0];

            const newEmbed = new EmbedBuilder()
            .setTitle(oldEmbed.title)
            .addFields(
                { name: oldEmbed.fields[0].name, value: oldEmbed.fields[0].value, inline: true },
                { name: oldEmbed.fields[4].name, value: oldEmbed.fields[4].value, inline: true },
            )
            .setColor(globals.embed.colorSecond)
            .setTimestamp();

            await message.edit({
                embeds: [newEmbed],
                components: []
            });

            await channel.send({
                content: `Inscriptions à l'In House n°${inhouse[0].id} terminées !\nLa composition des équipes va arriver d'ici peu`
            });

            await interaction.reply({
                content: `Inscriptions terminées avec succès`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "remplacer") {

            // Get command data
            const replaced = interaction.options.getUser("remplacé");
            const replacedBy = interaction.options.getUser("remplaçant");

            // Check if there's an inhouse running
            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            if(inhouse.length == 0) {
                return await interaction.reply({
                    content: `Il n'y a aucun inhouse en cours`,
                    ephemeral: true
                });
            }

            // Check if the replaced user is participating to this inhouse
            const particpating = await db.query(`SELECT NULL FROM inhouse_participants WHERE discord_id = '${replaced.id}' AND inhouse_id = ${inhouse[0].id}`);

            if(particpating.length == 0) {
                return await interaction.reply({
                    content: `Le joueur ne peut pas être remplacé, il ne participe pas à cet inhouse`,
                    ephemeral: true
                });
            }

            // Check if it is the same user
            if(replaced.id == replacedBy.id) {
                return await interaction.reply({
                    content: `Vous ne pouvez pas remplacer un participant par lui-même`,
                    ephemeral: true
                });
            }

            // Replace the user
            await db.query(`UPDATE inhouse_participants SET discord_id = '${replacedBy.id}' WHERE inhouse_id = ${inhouse[0].id} AND discord_id = '${replaced.id}'`);

            await interaction.reply({
                content: `<@${replaced.id}> a été remplacé par <@${replacedBy.id}>`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "mvp") {

            const user = interaction.options.getUser("membre");

            // Get the user in the guild
            const member = await interaction.guild.members.fetch(user.id);

            // Get the role
            const role = await interaction.guild.roles.cache.get(globals.servers.dev.role.mvp);

            // Check if a member has the mvp role
            const roleOwners = await role.members.map(m => m.user.id);

            if(roleOwners.length > 0) {
                // Remove the role to owners
                for(let ownerId of roleOwners) {
                    const roleOwner = await interaction.guild.members.cache.find(m => m.user.id == ownerId);
                    roleOwner.roles.remove(role);
                }
            }

            // Give the role to the member
            await member.roles.add(role);

            await interaction.reply({
                content: `le role <@&${role.id}> a bien été donné à <@${user.id}>`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "équipes") {

            const participants = await db.query(`SELECT c.riot_puuid, c.discord_id, p.toplaner_priority, p.jungler_priority, p.midlaner_priority, p.botlaner_priority, p.support_priority FROM inhouse_participants p, comptes c WHERE c.discord_id = p.discord_id AND p.inhouse_id = ( SELECT id FROM inhouse_session ORDER BY id DESC LIMIT 1 )`);
            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

            //if(participants.length < 10) {
            //    return await interaction.reply({
            //        content: `Il faut au minimum 10 participants pour pouvoir générer les équipes`,
            //        ephemeral: true
            //    });
            //}

            // Define participation priority and elo of each player
            for(let i = 0; i < participants.length; i++) {
                const p = participants[i];

                // Define priority
                const checkPriority = await db.query(`SELECT inhouse_id FROM inhouse_participants WHERE discord_id = '${p.discord_id}' ORDER BY inhouse_id DESC LIMIT 1, 1`);
                const inhouse = await db.query(`SELECT * from inhouse_session ORDER BY id DESC LIMIT 1`);

                if(checkPriority.length == 0) participants[i].priority = 0;
                else if(checkPriority[0].inhouse_id != parseInt(inhouse[0].id) - 1) participants[i].priority = 1;
                else participants[i].priority = 2;

                // Get elo
                let elo;
                try {
                    const summoner = (await lApi.Summoner.getByPUUID(p.riot_puuid, Constants.Regions.EU_WEST)).response;
                    let ranks = (await lApi.League.bySummoner(summoner.id, Constants.Regions.EU_WEST)).response;

                    if(ranks.length == 0) {
                        elo = 0;
                    } else {
                        let found = false;
                        for(let r of ranks) {
                            if(r.queueType == "RANKED_SOLO_5x5") {
                                found = true;
                                let j;
                                for(j = 0; j < globals.lol.tier.length; j++) {
                                    if(globals.lol.tier[j] == r.tier) {
                                        j = j*400;
                                        break;
                                    }
                                }

                                let k;
                                for(k = 0; k < globals.lol.rank.length; k++) {
                                    if(globals.lol.rank[k] == r.rank) {
                                        k = k*100;
                                        break;
                                    }
                                }

                                elo = j + k + parseInt(r.leaguePoints);
                                break;
                            }
                        }

                        if(!found) elo = 0;
                    }
                } catch(error) {
                    console.error(error);

                    return await interaction.reply({
                        content: `Erreur lors de la récupération du rang d'un des comptes, réessayez plus tard`,
                        ephemeral: true
                    });
                }

                participants[i].elo = elo;

                // Wait a little to avoid api call overload
                setTimeout(() => {}, 100);
            }

            // Generate teams


        } else {

            await interaction.reply({
                content: `Commande non reconnue, merci de prévenir ${globals.developer.discord.globalName}`,
                ephemeral: true
            });
            
        }
    }
}