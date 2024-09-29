import {  } from 'discord.js';

export const autocomplete = {
    async execute(interaction){

        // Various autocomplete values
        const values = [ "Banana", "Apple", "Raspberry", "Pear", "Orange", "Strawberry", "Blueberry", "Dragon fruit" ];
        
        // Get the content of input field
        const input = interaction.options.getFocused();

        // Filter
        const filtered = values.filter(choice => choice.startsWith(input));

        // Display the leagues
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    }
}