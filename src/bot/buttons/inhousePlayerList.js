import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, IntentsBitField, discordSort, AttachmentBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import { rApi, lApi } from '../../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        const csvRows = [
            [ // First row
                "Identifiant discord", 
                "Nom discord", 
                "Dernière participation", 
                "Jouait son role voulu", 
                "Toplaner", 
                "Jungler", 
                "Midlaner", 
                "ADC", 
                "Support", 
                "Compte principal",
                "Rang"
            ]
        ];

        // Get registered members
        const members = await db.query(`SELECT * FROM inhouse_participant WHERE inhouse_id = (SELECT id FROM inhouse_session ORDER BY id DESC LIMIT 1)`);

        for(let member of members) {

            const row = [];
            let discordId, discordGlobalName;
            let latestParticipation, wasOnMainRole;
            let toplaner, jungler, midlaner, botlaner, support;
            let mainAccount, mainAccountRank;

            // Get all member accounts
            const accounts = await db.query(`SELECT * from account WHERE discord_id = '${member.discord_id}'`);
        
            for(let account of accounts) {
                const riotAccount = (await rApi.Account.getByPUUID(account.riot_puuid, Constants.RegionGroups.EUROPE)).response;
                const lolAccount = (await lApi.Summoner.getByPUUID(account.riot_puuid, Constants.Regions.EU_WEST)).response;
                const ranks = (await lApi.League.bySummoner(lolAccount.id, Constants.Regions.EU_WEST)).response;

                for(let rank of ranks) {
                    if(rank.queueType == 'RANKED_SOLO_5x5') {
                        if(account.is_main == 1) {
                            mainAccount = `https://op.gg/summoners/euw/${encodeURI(riotAccount.gameName)}-${encodeURI(riotAccount.tagLine)}`;
                            mainAccountRank = `${rank.tier} ${rank.rank}`;
                        }
                    }
                }
            }

            const lastInHouse = await db.query(`SELECT * FROM inhouse_team WHERE inhouse_id <> ${member.inhouse_id} ORDER BY inhouse_id DESC LIMIT 1`);
            const chosenRole = (Object.keys(member).find(key => member[key] == 2)).substring(3);
            const hasTheChosenRole = await db.query(`SELECT * FROM inhouse_team WHERE inhouse_id <> ${member.inhouse_id} AND ${chosenRole} = '${member.discord_id}' ORDER BY inhouse_id DESC LIMIT 1`);

            //Fill variables
            discordId = accounts[0].discord_id;
            discordGlobalName = (await interaction.guild.members.cache.find(m => m.user.id == discordId)).user.globalName;
            latestParticipation = (lastInHouse.length > 0) ? `In House ${lastInHouse[0].inhouse_id}` : `Jamais`;
            wasOnMainRole = (hasTheChosenRole.length > 0) ? `Oui` : `Non` ;
            toplaner = (member.is_toplaner > 0) ? ((member.is_toplaner == 2) ? `Principal` : `Secondaire`) : `Non`;
            jungler = (member.is_jungler > 0) ? ((member.is_jungler == 2) ? `Principal` : `Secondaire`) : `Non`;
            midlaner = (member.is_midlaner > 0) ? ((member.is_midlaner == 2) ? `Principal` : `Secondaire`) : `Non`;
            botlaner = (member.is_botlaner > 0) ? ((member.is_botlaner == 2) ? `Principal` : `Secondaire`) : `Non`;
            support = (member.is_support > 0) ? ((member.is_support == 2) ? `Principal` : `Secondaire`) : `Non`;

            row.push(discordId, discordGlobalName, latestParticipation, wasOnMainRole, toplaner, jungler, midlaner, botlaner, support, mainAccount, mainAccountRank);
            csvRows.push(row);
        }

        let csvContent = ``;
        csvRows.forEach(function(rowArray) {
            let row = rowArray.join(",");
            csvContent += row + `\r\n`
        });

        const csv = new AttachmentBuilder(Buffer.from(csvContent, 'utf-8'), { name: "joueurs.csv" });

        return await interaction.reply({
            content: `Liste des joueurs inscrits`,
            files: [csv],
            ephemeral: true
        });
    }
}