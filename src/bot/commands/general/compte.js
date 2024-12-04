import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { globals } from '../../../globals.js';
import { Constants } from 'twisted';
import Canvas from '@napi-rs/canvas';
import { db } from '../../connections/database.js';
import { rApi, lApi } from '../../connections/lolapi.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("compte")
    .setDescription("Gestion de la lisaison entre un compte lol et le bot")
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("ajouter")
        .setDescription("Ajoute votre compte LoL principal à votre compte discord")
        .addStringOption( (option) =>
            option
            .setName("nom")
            .setDescription("Exemple: xXKILL3RXx rpz#Yukii")
            .setRequired(true)
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("supprimer")
        .setDescription("Supprime le compte lié")
        .addStringOption( (option) =>
            option
            .setName("nom")
            .setDescription("Nom du compte dont vous souhaitez supprimer la liaison")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("liste")
        .setDescription("Affiche la liste des compte liés")
        .addUserOption( (option) =>
            option
            .setName("membre")
            .setDescription("Membre dont on veut la liste des comptes liés")
            .setRequired(false)
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("principal")
        .setDescription("Définit votre compte principal pour le bot")
        .addStringOption( (option) =>
            option
            .setName("nom")
            .setDescription("Nom du compte principal")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    , async execute(interaction){

        if(interaction.options.getSubcommand() == "ajouter") {

            // Get command data
            const account = interaction.options.getString("nom").split("#");

            // Check if the member has too many accounts linked
            const accountNumber = await db.query(`SELECT COUNT(*) AS "number" FROM account WHERE discord_id = '${interaction.user.id}'`);
            if(accountNumber.number >= 20) {
                return await interaction.reply({
                    content: `Vous avez atteint la limite de comptes liés\nVeuillez supprimer un compte pour pouvoir en ajouter un autre`,
                    ephemeral: true
                });
            }

            // Get the summoner account
            let { riotAccount, summoner } = await getLoLAccount(account[0], account[1]);

            if(riotAccount == null && summoner == null) return;

            if(riotAccount == undefined || summoner == undefined) {
                return await interaction.reply({
                    content: `Aucun compte trouvé avec le nom d'invocateur \`${account[0]}#${account[1]}\``,
                    ephemeral: true
                });
            }

            // Check if the account is already linked
            const linked = await db.query(`SELECT * FROM account WHERE riot_puuid = '${riotAccount.puuid}'`);
            if(linked.length > 0) {
                if(linked[0].discord_id == interaction.user.id) {
                    return await interaction.reply({
                        content: `Ce compte Riot est déjà lié à votre compte discord`,
                        ephemeral: true
                    });
                } else {
                    return await interaction.reply({
                        content: `Ce compte Riot est déjà lié au compte discord de <@${linked[0].discord_id}>`,
                        ephemeral: true
                    });
                }
            }

            // Get account rank
            let ranks;
            let rank;
            try {
                ranks = (await lApi.League.bySummoner(summoner.id, Constants.Regions.EU_WEST)).response;
            } catch(error) {
                console.error(error);

                return await interaction.reply({
                    content: `Erreur lors de la récupération du rang du compte`,
                    ephemeral: true
                });
            }

            if(ranks.length == 0) {
                rank = "UNRANKED";
            } else {
                for(let r of ranks) {
                    if(r.queueType == "RANKED_SOLO_5x5") {
                        rank = r.tier;
                        break;
                    }
                }
            }

            const canvas = await generateAccountCanvas(riotAccount, summoner, rank);
            const image = new AttachmentBuilder(await canvas.encode("png"), { name: "image.png" });

            // Create confirm button
            const confirm = new ButtonBuilder()
            .setCustomId(`compteVerification1${globals.separator}${summoner.profileIconId}${globals.separator}${account[0]}${globals.separator}${account[1]}`)
            .setLabel("Oui")
            .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
            .addComponents(confirm);

            const embed = new EmbedBuilder()
            .setTitle("Est-ce votre compte ?")
            .setImage(`attachment://image.png`)
            .setTimestamp()
            .setColor(globals.embed.colorMain);

            await interaction.reply({
                embeds: [embed],
                files: [image],
                components: [row],
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "supprimer") {

            // Get command data
            const account = interaction.options.getString("nom");

            const exists = await db.query(`SELECT NULL FROM account WHERE riot_puuid = '${account}'`);

            if(exists.length == 0) {
                if(account == "noLinks") {
                    return await interaction.reply({
                        content: `Vous n'avez lié aucun compte Riot à votre compte discord`,
                        ephemeral: true
                    });
                } else {
                    return await interaction.reply({
                        content: `Veuillez sélectionner un des comptes parmi la liste`,
                        ephemeral: true
                    });
                }
            }

            await db.query(`DELETE FROM account WHERE riot_puuid = '${account}'`);

            await interaction.reply({
                content: `La liaison a été supprimée`,
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "liste") {

            // Get command data
            const member = (interaction.options.getUser("membre") == undefined) ? interaction.user : interaction.options.getUser("membre");
            
            // Get linked accounts in database
            const linked = await db.query(`SELECT riot_puuid, is_main FROM account WHERE discord_id = '${member.id}'`);

            if(linked.length == 0) {
                return await interaction.reply({
                    content: `<@${member.id}> n'a lié aucun compte Riot à son compte discord`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
            .setTitle(`Liste des comptes liés de ${member.globalName}`)
            .setColor(globals.embed.colorMain)
            .setTimestamp();

            let desc = "";

            for(let link of linked) {
                const riotAccount = (await rApi.Account.getByPUUID(link.riot_puuid, Constants.RegionGroups.EUROPE)).response;

                desc += (link.is_main == 0) ? `${riotAccount.gameName}#${riotAccount.tagLine}\n` : `${riotAccount.gameName}#${riotAccount.tagLine} - principal\n`;
            }

            embed.setDescription(desc);

            await interaction.reply({
                embeds: [embed]
            });

        } else if(interaction.options.getSubcommand() == "principal") {

            // Get command data
            const account = interaction.options.getString("nom");

            const exists = await db.query(`SELECT NULL FROM account WHERE riot_puuid = '${account}'`);

            if(exists.length == 0) {
                if(account == "noLinks") {
                    return await interaction.reply({
                        content: `Vous n'avez lié aucun compte Riot à votre compte discord`,
                        ephemeral: true
                    });
                } else {
                    return await interaction.reply({
                        content: `Veuillez sélectionner un des comptes parmi la liste`,
                        ephemeral: true
                    });
                }
            }

            await db.query(`UPDATE account SET is_main = 0 WHERE discord_id = '${interaction.user.id}'`);

            await db.query(`UPDATE account SET is_main = 1 WHERE riot_puuid = '${account}'`);

            return await interaction.reply({
                content: `Compte principal défini`,
                ephemeral: true
            });

        } else {
            return await interaction.reply({
                content: `Commande non reconnue`,
                ephemeral: true
            });
        }


        async function getLoLAccount(name, tag) {

            let riotAccount;
            let summoner;

            if(!name || !tag){
                return await interaction.reply({
                    content: `Veuillez renseigner correctement votre compte : \`nomDuCompte#tag\``,
                    ephemeral: true
                });
            }

            try {
                riotAccount = (await rApi.Account.getByRiotId(name, tag, Constants.RegionGroups.EUROPE)).response;
                summoner = (await lApi.Summoner.getByPUUID(riotAccount.puuid, Constants.Regions.EU_WEST)).response;
            } catch(error) {
                if(error.body.status.status_code != 404) {
                    console.error(error.body);

                    await interaction.reply({
                        content: `Une erreur inconnue est survenue lors de la récupération du compte.\nSi l'erreur persiste merci de contacter ${globals.developer.discord.globalName}\nCode ${error.body.status.status_code}`,
                        ephemeral: true
                    });

                    riotAccount = null;
                    summoner = null;
                }
            }

            return { riotAccount, summoner };
        }


        async function generateAccountCanvas(account, summoner, rank){
            // Create canvas
            const canvas = Canvas.createCanvas(500, 200);
            const ctx = canvas.getContext("2d");

            // Generate background
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Load and resize image
            const profileIcon = await Canvas.loadImage(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.profileIconId}.jpg`);

            const height = 150;
            const topMargin = 25;
            const leftMargin = 25;
            let targetWidth = (profileIcon.width / profileIcon.height) * height;

            // Place image into the canvas
            ctx.drawImage(profileIcon, leftMargin, topMargin, targetWidth, height);

            // Display summoner name and level
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `25px sans-serif`;

            const summonerX = 200;
            const summonerY = 50;

            ctx.fillText(`${account.gameName}#${account.tagLine}`, summonerX, summonerY);

            const levelX = 200;
            const levelY = 100;

            ctx.fillText(`Niveau: ${summoner.summonerLevel}`, levelX, levelY);

            // Display rank
            const rankTextX = 200;
            const rankTextY = 150;

            ctx.fillText(`Rang:`, rankTextX, rankTextY);

            const rankIcon = await Canvas.loadImage(`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-mini-crests/${rank.toLowerCase()}.png`);

            const rankHeight = 50;
            const rankTopMargin = 120;
            const rankLeftMargin = 275;
            let rankTargetWidth = (rankIcon.width / rankIcon.height) * rankHeight;

            // Place image into the canvas
            ctx.drawImage(rankIcon, rankLeftMargin, rankTopMargin, rankTargetWidth, rankHeight);

            return canvas;
        }
        
    }
}