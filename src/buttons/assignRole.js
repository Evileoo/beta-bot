import { defineRoles } from '../functions/defineRoles.js'

export const button = {
    async execute(interaction, buttonData) {

        // Update roles
        await defineRoles.updateRoles(interaction, buttonData[1]);

        // Display the embed
        await defineRoles.updateEmbed(interaction, true);

        
    }
}