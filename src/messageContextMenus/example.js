import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

export const messageContextMenu = {
    data: new ContextMenuCommandBuilder()
    .setName("example")
    .setType(ApplicationCommandType.Message)
    , async execute(interaction) {
        await interaction.reply({
            content: `Message Context Menu example`,
            ephemeral: true
        });
    }
}