import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, subtext } from 'discord.js';
import { globals } from '../globals.js';
import { Constants } from 'twisted';
import Canvas from '@napi-rs/canvas';
import { db } from '../connections/database.js';
import { rApi, lApi } from '../connections/lolapi.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("compte")
    .setDescription("Gestion de la lisaison entre un compte lol et le bot")
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("enregistrer")
        .setDescription("Ajoute votre compte LoL principal à votre compte discord")
        .addStringOption( (option) =>
            option
            .setName("compte")
            .setDescription("Exemple: otpdravenL9#ff15")
            .setRequired(true)
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("supprimer")
        .setDescription("Supprime le compte lié")
    )
    , async execute(interaction){

        if(interaction.options.getSubcommand() == "enregistrer") {

            // Get command data
            const account = interaction.options.getString("compte").split("#");

            // Get the summoner account
            let { riotAccount, summoner } = await getLoLAccount(account[0], account[1]);

            if(riotAccount == null && summoner == null) return;

            if(riotAccount == undefined || summoner == undefined) {
                return await interaction.reply({
                    content: `Aucun compte trouvé avec le nom d'invocateur \`${account[0]}#${account[1]}\``,
                    ephemeral: true
                });
            }

            // Check if the member is already registered
            const registered = await db.query(`SELECT riot_puuid FROM comptes WHERE discord_id = '${interaction.user.id}'`);
            const riotAccountRegistered = await db.query(`SELECT discord_id FROM comptes WHERE riot_puuid = '${riotAccount.puuid}'`);

            // If the riot account is already registered on this discord
            if(registered.length > 0 && registered[0].riot_puuid == riotAccount.puuid) {
                return await interaction.reply({
                    content: `Ce compte Riot est déjà synchronisé sur votre discord`,
                    ephemeral: true
                });
            }

            // If an other riot account is already registered to this discord
            let changeAccountText = "";
            if(registered.length > 0) {
                try {
                    let otherRiotAccount = (await rApi.Account.getByPUUID(registered[0].riot_puuid, Constants.RegionGroups.EUROPE)).response;

                    changeAccountText = `Un autre compte riot est lié à votre discord : ${otherRiotAccount.gameName}#${otherRiotAccount.tagLine}.\nSouhaitez vous changer ?\n\nPour rappel le compte lié doit être votre compte **principal**`;

                } catch(error) {
                    console.error(error);

                    changeAccountText = `Un autre compte riot est lié à votre discord, souhaitez vous le changer ?\n\nPour rappel le compte lié doit être votre compte **principal**`;
                }
            }

            // If this riot account is linked to an other discord account
            if(riotAccountRegistered.length > 0 && interaction.user.id != riotAccountRegistered[0].discord_id){
                try {
                    const otherDiscordAccount = await interaction.guild.members.fetch(riotAccountRegistered[0].discord_id);

                    return await interaction.reply({
                        content: `Ce compte riot est déjà lié à <@${riotAccountRegistered[0].discord_id}>`,
                        ephemeral: true
                    });
                } catch(error) {
                    return await interaction.reply({
                        content: `Ce compte riot est déjà lié à un autre compte discord n'étant plus sur le serveur`,
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
            .setCustomId(`registerVerification${globals.separator}${summoner.profileIconId}${globals.separator}${account[0]}${globals.separator}${account[1]}`)
            .setLabel("Oui")
            .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
            .addComponents(confirm);

            const embed = new EmbedBuilder()
            .setTitle("Est-ce votre compte ?")
            .setImage(`attachment://image.png`)
            .setTimestamp()
            .setColor(globals.embed.colorMain);

            if(changeAccountText != "") embed.addFields({ name: `Un autre compte est lié`, value: changeAccountText });

            await interaction.reply({
                embeds: [embed],
                files: [image],
                components: [row],
                ephemeral: true
            });

        } else if(interaction.options.getSubcommand() == "supprimer") {

            const exists = await db.query(`SELECT NULL FROM comptes WHERE discord_id = '${interaction.user.id}'`);

            if(exists.length == 0) {
                return await interaction.reply({
                    content: `Vous n'avez lié aucun compte Riot à votre compte discord`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
            .setTitle("Êtes-vous sûr de vouloir supprimer la liaision au compte riot ?")
            .setDescription("Vos préférences de role vont être supprimés.\nSi vous souhaitez que toutes vos données soient supprimées, contactez un member du staff")
            .setColor(globals.embed.colorMain)
            .setTimestamp();

            const button = new ButtonBuilder()
            .setCustomId("unlink")
            .setLabel("Supprimer la liaison")
            .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
            .addComponents(button);

            await interaction.reply({
                embeds: [embed],
                components: [row],
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