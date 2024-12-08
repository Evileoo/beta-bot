import {  } from 'discord.js';
import { globals } from '../../globals.js';
import { Constants } from 'twisted';
import { db } from '../../connections/database.js';
import { rApi, lApi } from '../../connections/lolapi.js';

export const autocomplete = {
    async execute(interaction){
        
        // Get linked accounts in database
        const linked = await db.query(`SELECT riot_puuid FROM account WHERE discord_id = '${interaction.user.id}'`);

        if(linked.length == 0) {
            return await interaction.respond([{name: `Aucun compte Riot n'est lié`, value: `noLinks`}]);
        }

        // Loop thru riot puuids to get account name and tag
        const accounts = [];

        for(let link of linked) {
            const riotAccount = (await rApi.Account.getByPUUID(link.riot_puuid, Constants.RegionGroups.EUROPE)).response;

            const account = {
                name: riotAccount.gameName + "#" + riotAccount.tagLine,
                value: riotAccount.puuid
            }
            accounts.push(account);
        }

        // Display linked accounts
        await interaction.respond(accounts);
    }
}