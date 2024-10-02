import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';
import Canvas from '@napi-rs/canvas';
import { db } from '../connections/database.js'

export const command = {
    data: new SlashCommandBuilder()
    .setName("inhouse")
    .setDescription("Crée une session de matchs inhouse")
    .addStringOption( (option) =>
        option
        .setName("date")
        .setDescription("Exemple: 31/12/2023 23h")
        .setRequired(true)
    )
    .addStringOption( (option) =>
        option
        .setName("elomin")
        .setDescription("Rang minimum pour participer")
        .setRequired(false)
    )
    .addStringOption( (option) =>
        option
        .setName("elomax")
        .setDescription("Rang maximum pour participer")
        .setRequired(false)
    )
    , async execute(interaction){

        // Get command data
        const date = interaction.options.getString("date");
        const elomin = interaction.options.getString("elomin");
        const elomax = interaction.options.getString("elomax");
        

        await interaction.reply({
            files: [],
            components: [],
            ephemeral: true
        });
    }
}