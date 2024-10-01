import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'

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

        const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("stringexample")
        .setPlaceholder("Choose something")
        .addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel("Banana")
            .setValue("b"),
            new StringSelectMenuOptionBuilder()
            .setLabel("Apple")
            .setValue("a"),
            new StringSelectMenuOptionBuilder()
            .setLabel("Pear")
            .setValue("p")
        )

        const row1 = new ActionRowBuilder()
        .addComponents(button);

        const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

        await interaction.reply({
            content: `Click the button to trigger a \`interaction.isButton\` event.\nThis button displays a modal. Submit this modal to trigger the \`interaction.isModalSubmit\` event.\n\nYou chose *${autocomplete}* btw`,
            components: [row2, row1]
        });
	},
};