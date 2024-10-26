import puppeteer from "puppeteer";

let championJson = {};

async function getLatestDDragon() {
    // If already fetched
    if(Object.keys(championJson).length > 0) return championJson;

    // fetch the last LoL patch
    const versions = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const latest = (await versions.json())[0];

    // fetch champions data
    const ddragon = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`);

    // extract data from json
    const champions = (await ddragon.json())["data"];
    championJson = champions;
    return champions;
}

async function getChampionByKey(key) {
    const champions = await getLatestDDragon();

    for(let championName in champions) {
        if(!champions.hasOwnProperty(championName)) continue;

        if(champions[championName]["key"] == key) {
            return champions[championName];
        }
    }

    return false;
}

export const sdl = {
    async getResults(url) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('.roomPickColumn');

        const data = await page.evaluate(() => {
            //const blueTeamPicks = Array.from(document.querySelectorAll(".roomPickColumn.blue > * > * > * > .champImage")).map(d => d.getAttribute("data-id"));
            
            return {
                blueTeamPicks: Array.from(document.querySelectorAll(".roomPickColumn.blue > * > * > * > .champImage")).map(d => d.getAttribute("data-id")),
                redTeamPicks: Array.from(document.querySelectorAll(".roomPickColumn.red > * > * > * > .champImage")).map(d => d.getAttribute("data-id")),
                blueTeamBans: Array.from(document.querySelectorAll(".roomBanRow.blue > * > * > * > .banChamp")).map(d => d.getAttribute("data-id")),
                redTeamBans: Array.from(document.querySelectorAll(".roomBanRow.red > * > * > * > .banChamp")).map(d => d.getAttribute("data-id")),
            };
        });

        await browser.close();

        console.log(await getChampionByKey(9));

        return data;
    }
}// https://draftlol.dawe.gg/NvxBNpz7