import {  } from 'discord.js';
import { globals } from '../../globals.js';
import { sdl } from '../functions/fetchDraftlol.js';

export const autocomplete = {
    async execute(interaction){

        const focusedValue = interaction.options.getFocused();
        
        const champions = await sdl.getLatestDDragon();

        const championList = [];
        let length = 0;

        for(let championName in champions) {
            if(!champions.hasOwnProperty(championName)) continue;

            if(champions[championName]["id"].startsWith(focusedValue)) {
                championList.push({name: `${champions[championName]["id"]}`, value: `${champions[championName]["id"]}`});
            }

            length++;

            if(length == 25) {
                break;
            }
        }

        // Display linked accounts
        await interaction.respond(championList);
    }
}