import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import puppeteer from 'puppeteer';
import { globals } from '../globals.js';
import { RiotApi, LolApi, Constants } from 'twisted';
import Canvas from '@napi-rs/canvas';

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
        const account = interaction.options.getString("compte").split("#");

        const rApi = new RiotApi({
            key: process.env.RIOTAPIKEY
        });
        const lApi = new LolApi({
            rateLimitRetry: true,
            rateLimitRetryAttempts: 2,
            concurrency: undefined,
            key: process.env.RIOTAPIKEY
        });

        let summoner;
        let ranks;
        let rank;

        try {
            const puuid = (await rApi.Account.getByRiotId(account[0], account[1], Constants.RegionGroups.EUROPE)).response.puuid;
            summoner = (await lApi.Summoner.getByPUUID(puuid, Constants.Regions.EU_WEST)).response;
            ranks = (await lApi.League.bySummoner(summoner.id, Constants.Regions.EU_WEST)).response;
        } catch(error) {

            console.error(error);
            return interaction.reply({
                content: `Aucun compte trouvé avec le nom d'invocateur \`${account}\``,
                ephemeral: true
            });
        }

        for(let r of ranks) {
            if(r.queueType == "RANKED_SOLO_5x5"){
                rank = r;
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
        
        const rankIcon = await Canvas.loadImage(`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-mini-crests/${rank.tier.toLowerCase()}.png`);

        const rankHeight = 50;
        const rankTopMargin = 120;
        const rankLeftMargin = 275;
        let rankTargetWidth = (rankIcon.width / rankIcon.height) * rankHeight;

        // Place image into the canvas
        ctx.drawImage(rankIcon, rankLeftMargin, rankTopMargin, rankTargetWidth, rankHeight);

        const image = new AttachmentBuilder(await canvas.encode("png"), { name: "image.png" });

        // Create confirm buttons
        const confirm = new ButtonBuilder()
        .setCustomId("registerConfirm")
        .setLabel("Confirmer")
        .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
        .addComponents(confirm);

        await interaction.reply({
            files: [image],
            components: [row],
            ephemeral: true
        });
    }
}