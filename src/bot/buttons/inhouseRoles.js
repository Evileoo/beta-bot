import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, InteractionResponse } from 'discord.js';
import { globals } from '../../globals.js';
import { lApi } from '../../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../../connections/database.js';
import { inhouseRoles } from '../functions/defineRoles.js';

export const button = {
    async execute(interaction, buttonData) {

        const changeRole = buttonData[1];
        const roles = {
            top: parseInt(buttonData[2].substring(0,1)),
            jgl: parseInt(buttonData[2].substring(1,2)),
            mid: parseInt(buttonData[2].substring(2,3)),
            bot: parseInt(buttonData[2].substring(3,4)),
            sup: parseInt(buttonData[2].substring(4,5))
        }

        const hasPriority2 = Object.values(roles).includes(2);

        for (let [key, value] of Object.entries(roles)) {
            if(key == changeRole) {
                if((value == 1 && hasPriority2) || (value == 2)) roles[key] = 0;
                else roles[key] += 1;
                break;
            }
        }

        const content = await inhouseRoles.message(roles, buttonData[3]);

        const confimRow = interaction.message.components[1];

        if(Object.values(roles).includes(2)) {
            confimRow.components[0].data.disabled = false;
            confimRow.components[0].data.custom_id = content.components[1].components[0].data.custom_id;
        } else {
            confimRow.components[0].data.disabled = true;
        }

        await interaction.update({
            embeds: [content.embeds[0]],
            components: [content.components[0], confimRow]
        });

    }
}