import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, InteractionResponse } from 'discord.js';
import { globals } from '../globals.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';
import { defineRoles } from '../functions/defineRoles.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get member data
        const member = await db.query(`SELECT riot_puuid FROM comptes WHERE discord_id = '${interaction.user.id}'`);
        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        // Check if the member is registered in database
        if(member.length == 0) {
            return await interaction.reply({
                content: `Vous n'avez pas connecté votre compte LoL au bot, veuillez faire la commande \`/compte enregistrer\``,
                ephemeral: true
            });
        }

        // Check if the member is already registered
        const registered = await db.query(`SELECT NULL FROM inhouse_participants WHERE discord_id = '${interaction.user.id}' AND inhouse_id = ${buttonData[2]}`);

        if(registered.length > 0)  {
            return await interaction.reply({
                content: `Vous êtes déjà inscrit, si vous souhaitez changer vos roles, désinscrivez vous et réinscrivez vous en cliquant sur le bouton \`S'inscrire avec des nouveaux roles\``,
                ephemeral: true
            });
        }

        // Check if the member has the required rank to participate
        try {
            const summoner = (await lApi.Summoner.getByPUUID(member[0].riot_puuid, Constants.Regions.EU_WEST)).response;
            const ranks = (await lApi.League.bySummoner(summoner.id, Constants.Regions.EU_WEST)).response;

            if(ranks.length == 0) {
                ranks[0].tier == "UNRANKED";
                ranks[0].queueType == "RANKED_SOLO_5x5";
            }
            
            for(let r of ranks) {

                if(r.queueType == "RANKED_SOLO_5x5") {
                    let ok = false;
                    let check = false;

                    for(let o of globals.lol.tier) {
                        if(inhouse[0].elomin == o) check = true;
                        else if (inhouse[0].elomax == o) check = false;
                        
                        if(check == true && r.tier == o) {
                            ok = true;
                            break;
                        }
                    }

                    if(ok == false) {
                        return await interaction.reply({
                            content: `Vous n'avez pas le rang de solo queue requis pour participer à cet In House`,
                            ephemeral: true
                        });
                    }
                }
            }

        } catch(error) {
            console.error(error);
            return await interaction.reply({
                content: `Impossible de vous inscrire pour le moment, désolé pour le dérangement.\nSi cette erreur persiste, merci de contacter ${globals.developer.discord.globalName}`,
                ephemeral: true
            });
        }

        if(buttonData[1] == "new") {
            // Register the user without roles
            await db.query(`INSERT INTO inhouse_participants (discord_id, inhouse_id) VALUES ('${interaction.user.id}', ${buttonData[2]})`);

            await defineRoles.updateEmbed(interaction, false);
        } else {
            // Get roles of last inhouse the user participated in
            const roles = await db.query(`SELECT toplaner_priority, jungler_priority, midlaner_priority, botlaner_priority, support_priority FROM inhouse_participants WHERE discord_id = '${interaction.user.id}' ORDER BY inhouse_id DESC LIMIT 1`);

            if(roles.length == 0) {
                return await interaction.reply({
                    content: `Vous n'avez jamais participé à un inhouse`,
                    ephemeral: true
                });
            }

            await db.query(`INSERT INTO inhouse_participants (discord_id, inhouse_id, toplaner_priority, jungler_priority, midlaner_priority, botlaner_priority, support_priority) VALUES ('${interaction.user.id}', ${buttonData[2]}, ${roles[0].toplaner_priority}, ${roles[0].jungler_priority}, ${roles[0].midlaner_priority}, ${roles[0].botlaner_priority}, ${roles[0].support_priority})`);

            let roleMessage = "";
            if(roles[0].toplaner_priority == 1) roleMessage += (roleMessage ? ", ": "") + "\n- toplaner";
            if(roles[0].jungler_priority == 1) roleMessage += (roleMessage ? ", ": "") + "\n- jungler";
            if(roles[0].midlaner_priority == 1) roleMessage += (roleMessage ? ", ": "") + "\n- midlaner";
            if(roles[0].botlaner_priority == 1) roleMessage += (roleMessage ? ", ": "") + "\n- adc";
            if(roles[0].support_priority == 1) roleMessage += (roleMessage ? ", ": "") + "\n- support";

            await interaction.reply({
                content: `Vous avez été inscrit avec ces roles : ${roleMessage}\n\nSi vous souhaitez les changer, désinsrivez-vous et réinscrivez vous en cliquant sur \`S'inscrire avec des nouveaux roles\``,
                ephemeral: true
            });
        }

        const registeredMembers = await db.query(`SELECT COUNT(*) AS 'total' FROM inhouse_participants WHERE inhouse_id = ${buttonData[2]}`);

        const channel = await interaction.client.channels.fetch(inhouse[0].channel_id);
        const message = await channel.messages.fetch(inhouse[0].message_id);

        const embed = message.embeds[0];
        embed.fields[4] = { name: embed.fields[4].name, value: `${registeredMembers[0].total}`, inline: embed.fields[4].inline }

        await message.edit({embeds: [embed]});

    }
}