import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import puppeteer from 'puppeteer';
import { globals } from '../globals.js';
import { Constants } from 'twisted';
import Canvas from '@napi-rs/canvas';
import { db } from '../connections/database.js';
import { rApi, lApi } from '../connections/lolapi.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("enregistrement")
    .setDescription("Enregistre ton compte LoL principal dans le bot")
    .addStringOption( (option) =>
        option
        .setName("compte")
        .setDescription("Exemple: joueurLoL#ff")
        .setRequired(true)
    )
    , async execute(interaction){

        // Get command data
        const account = interaction.options.getString("compte").split("#");

        // Get the summoner account
        let riotAccount;
        let summoner;

        try {
            riotAccount = (await rApi.Account.getByRiotId(account[0], account[1], Constants.RegionGroups.EUROPE)).response;
            summoner = (await lApi.Summoner.getByPUUID(riotAccount.puuid, Constants.Regions.EU_WEST)).response;
        } catch(error) {
            console.error(error);
            return interaction.reply({
                content: `Aucun compte trouvé avec le nom d'invocateur \`${account[0]}#${account[1]}\``,
                ephemeral: true
            });
        }

        // Check if the member is already registered
        const registered = await db.query(`SELECT riot_puuid FROM comptes WHERE discord_id = '${interaction.user.id}' AND link_status = 'linked'`);
        const riotAccountRegistered = await db.query(`SELECT discord_id FROM comptes WHERE riot_puuid = '${riotAccount.puuid}' AND link_status = 'linked'`);

        // If the riot account is already registered on this discord
        if(registered.length > 0 && registered[0].riot_puuid == riotAccount.puuid) {
            return await interaction.reply({
                content: `Ce compte Riot est déjà synchronisé sur votre discord`,
                ephemeral: true
            });
        }

        // If an other riot account is already registered to this discord
        if(registered.length > 0) {
            try {
                let otherRiotAccount = (await rApi.Account.getByPUUID(registered[0].riot_puuid, Constants.RegionGroups.EUROPE)).response;

                return await interaction.reply({
                    content: `Vous avez déjà lié un autre compte Riot à votre discord: ${otherRiotAccount.gameName}#${otherRiotAccount.tagLine}`,
                    ephemeral: true
                });
            } catch(error) {
                console.error(error);
                return await interaction.reply({
                    content: `Un autre compte riot est lié à votre discord, merci de le délier s'il ne s'agit pas de votre compte principal\nNB : Une erreur est survenue lors de la récupération du nom du compte, désolé pour le dérangement\nMerci de prévenir ${globals.developer.discord.globalName}`,
                    ephemeral: true
                });
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
            console.log(error);

            return await interaction.reply({
                content: `Erreur lors de la récupération du rang du compte`,
                ephemeral: true
            });
        }

        for(let r of ranks) {
            if(r.queueType == "RANKED_SOLO_5x5") {
                rank = r.tier;
                break;
            }
        }

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

        ctx.fillText(`${account[0]}#${account[1]}`, summonerX, summonerY);

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

        const image = new AttachmentBuilder(await canvas.encode("png"), { name: "image.png" });

        // Create confirm button
        const confirm = new ButtonBuilder()
        .setCustomId(`registerVerification${globals.separator}${summoner.profileIconId}`)
        .setLabel("Oui")
        .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
        .addComponents(confirm);

        const embed = new EmbedBuilder()
        .setTitle("Est-ce votre compte ?")
        .setImage(`attachment://image.png`)
        .setTimestamp()
        .setColor(globals.embed.colorMain);

        // Update the database
        const notFinished = await db.query(`SELECT riot_puuid FROM comptes WHERE discord_id = '${interaction.user.id}' AND link_status <> 'linked'`);
        if(notFinished.length > 0) {
            await db.query(`UPDATE comptes SET riot_puuid = '${riotAccount.puuid}' WHERE discord_id = '${interaction.user.id}' AND link_status <> 'linked'`);
        } else {
            await db.query(`INSERT INTO comptes (discord_id, riot_puuid, link_status) VALUES ('${interaction.user.id}', '${riotAccount.puuid}', 'unlinked')`);
        }

        await interaction.reply({
            embeds: [embed],
            files: [image],
            components: [row],
            ephemeral: true
        });
    }
}