import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { globals } from '../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../connections/database.js'

export const command = {
    data: new SlashCommandBuilder()
    .setName("inhouse")
    .setDescription("Gestion des sessions inhouse")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.CreateEvents)
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
                {name: `Non classé`, value: `Non classé${globals.separator}unranked`},
                {name: `Bronze`, value: `Bronze${globals.separator}bronze`},
                {name: `Argent`, value: `Argent${globals.separator}silver`},
                {name: `Or`, value: `Or${globals.separator}gold`},
                {name: `Platine`, value: `Platine${globals.separator}platinum`},
                {name: `Émeraude`, value: `Émeraude${globals.separator}emerald`},
                {name: `Diamant`, value: `Diamant${globals.separator}diamond`},
                {name: `Maître`, value: `Maître${globals.separator}master`},
                {name: `Grand Maître`, value: `Grand Maître${globals.separator}grandmaster`},
                {name: `Challenger`, value: `Challenger${globals.separator}challenger`},
            )
        )
        .addStringOption( (option) =>
            option
            .setName("elomax")
            .setDescription("Rang maximum pour participer")
            .setRequired(false)
            .addChoices(
                {name: `Non classé`, value: `Non classé${globals.separator}unranked`},
                {name: `Bronze`, value: `Bronze${globals.separator}bronze`},
                {name: `Argent`, value: `Argent${globals.separator}silver`},
                {name: `Or`, value: `Or${globals.separator}gold`},
                {name: `Platine`, value: `Platine${globals.separator}platinum`},
                {name: `Émeraude`, value: `Émeraude${globals.separator}emerald`},
                {name: `Diamant`, value: `Diamant${globals.separator}diamond`},
                {name: `Maître`, value: `Maître${globals.separator}master`},
                {name: `Grand Maître`, value: `Grand Maître${globals.separator}grandmaster`},
                {name: `Challenger`, value: `Challenger${globals.separator}challenger`},
            )
        )
        .addIntegerOption( (option) =>
            option
            .setName("rolelimite")
            .setDescription("Limite de joueurs par role")
            .setRequired(false)
        )
    )
    
    , async execute(interaction){

        if(interaction.options.getSubcommand("créer")) {
            // Get command data
            const date = interaction.options.getString("date");
            const elomin = (interaction.options.getString("elomin") == null) ? `Non classé${globals.separator}unranked`.split(globals.separator) : interaction.options.getString("elomin");
            const elomax = (interaction.options.getString("elomax") == null) ? `Challenger${globals.separator}challenger`.split(globals.separator) : interaction.options.getString("elomax");
            const limit = interaction.options.getInteger("rolelimite");

            // Format date
            const dmy = date.split("/");
            const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

            // Format embed messages
            const limitMessage = (limit == null) ? `aucune` : limit;

            // Generate message
            const embed = new EmbedBuilder()
            .setTitle(`Nouvel In House`)
            .addFields(
                { name: `Date`, value: `<t:${dateTimeDiscord}:D>`},
                { name: `Rang minimum`, value: elomin[0], inline: true },
                { name: `Rang maximum`, value: elomax[0], inline: true },
                { name: `Limite de joueurs par role`, value: `${limitMessage}` },
                { name: `Nombre de joueurs inscrits`, value: `0` },
            )
            .setColor(globals.embed.colorMain)
            .setTimestamp();

            const button = new ButtonBuilder()
            .setCustomId(`inhouseregister`)
            .setLabel(`S'inscrire`)
            .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
            .addComponents(button);

            // Send message
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });

            // Update database
            interaction.channel.messages.fetch({ limit: 1 }).then(async (message) => {
                await db.query(`INSERT INTO inhouse_session (tms, elomin, elomax, role_limit, guild_id, channel_id, message_id) VALUES ('${date}', '${elomin[1]}', '${elomax[1]}', ${limit}, '${interaction.guild.id}', '${interaction.channel.id}', '${message.first().id}')`);
            });
        } else {

        }
    }
}