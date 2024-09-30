import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { globals } from '../globals.js';

export const modal = {
    async execute(interaction, modalData){
        // Get the user inputs
        const link = interaction.fields.getTextInputValue("link");

        const fetched = interaction.message.embeds[0].data;

        // rebuild the embed
        const embed = new EmbedBuilder()
        .setTitle(fetched.title)
        .setDescription(fetched.description)
        .addFields(
            { name: `${fetched.fields[0].name}`, value: `${fetched.fields[0].value}` }
        );

        if(modalData[1] == "add") {
            embed.addFields(
                { name: `opgg des adversaires`, value: `[lien](${link})` },
                { name: `${fetched.fields[1].name}`, value: `${fetched.fields[1].value}` }
            );
        } else if(modalData[1] == "edit") {
            embed.addFields(
                { name: `${fetched.fields[1].name}`, value: `[lien](${link})` },
                { name: `${fetched.fields[2].name}`, value: `${fetched.fields[2].value}` }
            );
        }

        const button = new ButtonBuilder()
        .setCustomId(`opgg${globals.separator}edit`)
        .setLabel(`Modifier l'opgg`)
        .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
        .setComponents(button);

        await interaction.message.edit({
            embeds: [embed],
            components: [row]
        });

        // Avoid "This interaction failed" message
        await interaction.deferUpdate();
    }
}