import {  } from 'discord.js';
import { globals } from '../../globals.js';
import { db } from '../connections/database.js';
import { lApi } from '../connections/lolapi.js';
import { Constants } from 'twisted';
import { inhouseRoles } from '../functions/defineRoles.js';

export const button = {
    async execute(interaction, buttonData) {

        // Check if the member is already registered
        const registered = await db.query(`SELECT * FROM inhouse_participant WHERE discord_id = '${interaction.user.id}' AND inhouse_id = (SELECT id FROM inhouse_session ORDER BY id DESC LIMIT 1)`);

        if(registered.length > 0) {
            return await interaction.reply({
                content: `Vous êtes déjà inscrit à cet In House`,
                ephemeral: true
            });
        }
        
        // Get member main account
        const account = await db.query(`SELECT riot_puuid FROM account WHERE discord_id = '${interaction.user.id}' AND is_main = 1`);

        if(account.length == 0) {
            return await interaction.reply({
                content: `Vous n'avez pas défini de compte principal`,
                ephemeral: true
            });
        }

        // Check member elo
        try {
            const summoner  = (await lApi.Summoner.getByPUUID(account[0].riot_puuid, Constants.Regions.EU_WEST)).response;
            const elo = (await lApi.League.bySummoner(summoner.id, Constants.Regions.EU_WEST)).response;

            if(elo.length == 0) {
                elo[0].tier == "UNRANKED";
                elo[0].queueType == "RANKED_SOLO_5x5";
            }
            
            let ok = false;

            const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);
            
            for(let e of elo) {
                if(e.queueType == "RANKED_SOLO_5x5") {
                    let check = false;

                    for(let o of globals.lol.tier) {
                        if(inhouse[0].elomin == o) check = true;
                        else if (inhouse[0].elomax == o) check = false;
                        
                        if(check == true && e.tier == o) {
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

            if(ok == false) {
                return await interaction.reply({
                    content: 'Seule la Solo Queue est prise en compte pour les inscriptions, veuillez vous classer pour participer',
                    ephemeral: true
                });
            }

        } catch(error) {
            console.error(error);
            return await interaction.reply({
                content: `Une erreur inconnue est survenue lors de la récupération de l'elo du compte.\nSi l'erreur persiste merci de contacter ${globals.developer.discord.globalName}\nCode ${error.body.status.status_code}`,
                ephemeral: true
            });
        }

        // Display the embed role selection message
        const content = await inhouseRoles.message(null, false);

        await interaction.reply({
            embeds: [content.embeds[0]],
            components: [content.components[0], content.components[1]],
            ephemeral: true
        });
    }
}