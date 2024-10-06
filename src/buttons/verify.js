import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, IntentsBitField } from 'discord.js';
import { globals } from '../globals.js';
import { rApi, lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { db } from '../connections/database.js';
import { defineRoles } from '../functions/defineRoles.js';

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

        const exists = await db.query(`SELECT NULL FROM comptes WHERE discord_id = '${interaction.user.id}'`);

        if(exists.length > 0) {
            return await interaction.reply({
                content: `Vous avez déjà terminé la vérification, veuillez rejeter tous les messages`,
                ephemeral: true
            });
        }

        // Update database
        await db.query(`INSERT INTO comptes (discord_id, riot_puuid) VALUES ('${interaction.user.id}', '${riotAccount.puuid}')`);

        await interaction.reply({
            content: `Vos comptes ont été liés, vous pouvez rejeter tous les messages.`,
            ephemeral: true
        });
    }
}