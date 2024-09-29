import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName("example")
		.setDescription("Just a message with a button")
        .addStringOption( (option) => 
            option
            .setAutocomplete(true)
            .setName("example")
            .setDescription("Displays predefined autocomplete values")
        )
	, async execute(interaction) {

        const autocomplete = interaction.options.getString("example");

        const button = new ButtonBuilder()
        .setCustomId(`example`)
        .setStyle(ButtonStyle.Primary)
        .setLabel("Click me!");

        const row = new ActionRowBuilder()
        .addComponents(button);

        await interaction.reply({
            content: `Click the button to trigger a \`interaction.isButton\` event.\nThis button displays a modal. Submit this modal to trigger the \`interaction.isModalSubmit\` event.\n\nYou chose *${autocomplete}* btw`,
            components: [row]
        });
	},
};