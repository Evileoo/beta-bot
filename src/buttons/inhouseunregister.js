import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, InteractionResponse } from 'discord.js';
import { globals } from '../globals.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        // Check if the user account exists
        const linked = await db.query(`SELECT NULL FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        if(linked.length == 0) {
            return await interaction.reply({
                content: `Vous n'avez pas lié votre compte Riot au bot, veuillez faire \`/compte enregistrer\` pour le lier`,
                ephemeral: true
            });
        }

        // Check if the user is registered to this inhouse
        const registered = await db.query(`SELECT NULL FROM inhouse_participants WHERE discord_id = '${interaction.user.id}' AND inhouse_id = ${buttonData[1]}`);

        if(registered.length == 0) {
            return await interaction.reply({
                content: `Vous n'êtes pas inscrit pour cet inhouse`,
                ephemeral: true
            });
        }

        //Unregister the user
        await db.query(`DELETE FROM inhouse_participants WHERE discord_id = '${interaction.user.id}' AND inhouse_id = ${buttonData[1]}`);

        await interaction.reply({
            content: `Vous avez été correctement désinscrit de cet inhouse`,
            ephemeral: true
        });

        const registeredMembers = await db.query(`SELECT COUNT(*) AS 'total' FROM inhouse_participants WHERE inhouse_id = ${buttonData[1]}`);
        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        const channel = await interaction.client.channels.fetch(inhouse[0].channel_id);
        const message = await channel.messages.fetch(inhouse[0].message_id);

        const embed = message.embeds[0];
        embed.fields[4] = { name: embed.fields[4].name, value: `${registeredMembers[0].total}`, inline: embed.fields[4].inline }

        await message.edit({embeds: [embed]});
    }
}