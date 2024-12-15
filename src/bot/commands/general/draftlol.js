import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { globals } from '../../../globals.js';
import Canvas from '@napi-rs/canvas';
import { sdl } from '../../functions/fetchDraftlol.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("draftlol")
    .setDescription("Récupération d'une draft fait via un outil sur navigateur")
    .addStringOption( option =>
        option
        .setName("lien")
        .setDescription("lien de la draft")
        .setRequired(true)
    )
    .addStringOption( option =>
        option
        .setName("mdp")
        .setDescription("mot de passe (s'il y en a un)")
    )
    .addStringOption( option =>
        option
        .setName("bluepick1")
        .setDescription("premier champion pick par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("bluepick2")
        .setDescription("deuxième champion pick par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("bluepick3")
        .setDescription("troisième champion pick par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("bluepick4")
        .setDescription("quatrième champion pick par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("bluepick5")
        .setDescription("cinquième champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("blueban1")
        .setDescription("premier champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("blueban2")
        .setDescription("deuxième champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("blueban3")
        .setDescription("troisième champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("blueban4")
        .setDescription("quatrième champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("blueban5")
        .setDescription("cinquième champion ban par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redpick1")
        .setDescription("premier champion pick par l'équipe bleue")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redpick2")
        .setDescription("deuxième champion pick par l'équiperougee")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redpick3")
        .setDescription("troisième champion pick par l'équiperougee")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redpick4")
        .setDescription("quatrième champion pick par l'équiperougee")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redpick5")
        .setDescription("cinquième champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redban1")
        .setDescription("premier champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redban2")
        .setDescription("deuxième champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redban3")
        .setDescription("troisième champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redban4")
        .setDescription("quatrième champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    .addStringOption( option =>
        option
        .setName("redban5")
        .setDescription("cinquième champion ban par l'équipe rouge")
        .setAutocomplete(true)
    )
    , async execute(interaction){
        const link = interaction.options.getString("lien");
        const pwd = (interaction.options.getString("mdp")) ? interaction.options.getString("mdp") : "";

        const replacements = {
            bluePicks: [
                interaction.options.getString("bluepick1"),
                interaction.options.getString("bluepick2"),
                interaction.options.getString("bluepick3"),
                interaction.options.getString("bluepick4"),
                interaction.options.getString("bluepick5")
            ],
            redPicks: [
                interaction.options.getString("redpick1"),
                interaction.options.getString("redpick2"),
                interaction.options.getString("redpick3"),
                interaction.options.getString("redpick4"),
                interaction.options.getString("redpick5")
            ],
            blueBans: [
                interaction.options.getString("blueban1"),
                interaction.options.getString("blueban2"),
                interaction.options.getString("blueban3"),
                interaction.options.getString("blueban4"),
                interaction.options.getString("blueban5")
            ],
            redBans: [
                interaction.options.getString("redban1"),
                interaction.options.getString("redban2"),
                interaction.options.getString("redban3"),
                interaction.options.getString("redban4"),
                interaction.options.getString("redban5")
            ]
        };


        const fetched = await sdl.getDraft(link, pwd, replacements);

        if(!fetched.hasOwnProperty("errorMessage")) {

            await interaction.reply({
                content: "chargement de la draft",
                ephemeral: true
            });

            const channel = interaction.guild.channels.cache.get(interaction.channelId);

            const canvas = await sdl.generateCanvas(fetched);

            const image = new AttachmentBuilder(await canvas.encode("png"), {
                name: "image.png"
            });

            return channel.send({
                files: [image],
                ephemeral: true
            });
        } else {
            return await interaction.reply({
                content: `${fetched.errorMessage}`,
                ephemeral: true
            });
        }
    }
}