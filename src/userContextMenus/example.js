import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

export const userContextMenu = {
    data: new ContextMenuCommandBuilder()
    .setName("example")
    .setType(ApplicationCommandType.User)
    , async execute(interaction) {
        await interaction.reply({
            content: `User Context Menu example`,
            ephemeral: true
        });
    }
}