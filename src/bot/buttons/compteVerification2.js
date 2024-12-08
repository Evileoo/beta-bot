import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, IntentsBitField } from 'discord.js';
import { globals } from '../../globals.js';
import { rApi, lApi } from '../../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get the verification profile picture
        const profileImageId = buttonData[1];

        // Check if the lol account has the right profile image
        let riotAccount, account;
        try {
            riotAccount = (await rApi.Account.getByRiotId(buttonData[2], buttonData[3], Constants.RegionGroups.EUROPE)).response;
            account = (await lApi.Summoner.getByPUUID(riotAccount.puuid, Constants.Regions.EU_WEST)).response;
        } catch(error) {
            console.error(error);
            
            return await interaction.reply({
                content: `Une erreur s'est produite, réessayez\nSi l'erreur persiste prévenez ${globals.developer.discord.globalName}`,
                ephemeral: true
            });
        }

        if(account.profileIconId != profileImageId) {
            return await interaction.reply({
                content: `L'image de votre compte n'est pas la bonne.\nSi vous avez mis la bonne attendez un peu`,
                ephemeral: true
            });
        }

        // Update database
        await db.query(`INSERT INTO account (discord_id, riot_puuid, is_main) VALUES ('${interaction.user.id}', '${riotAccount.puuid}', 0)`);

        await interaction.update({
            content: `Vos comptes ont été liés, vous pouvez remettre votre ancienne image de profil.\nPour voir vos comptes Riot liés au bot, faites la commande \`/compte liste\``,
            embeds : [],
            components : [],
            files: [],
            ephemeral: true
        });
    }
}