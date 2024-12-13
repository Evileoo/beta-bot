import axios from "axios";

let champsJson;
export const sdl = {
    async getLatestDDragon() {

        // Check if already checked
        if(champsJson) {
            return champsJson
        }

        // fetch the last LoL patch
        const versions = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const latest = (await versions.json())[0];
    
        // fetch champions data
        const ddragon = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`);
    
        // extract data from json
        const champions = (await ddragon.json())["data"];
        champsJson = champions;
        return champsJson;
    },
    async getChampionByName(name) {
        const champions = await sdl.getLatestDDragon();

        for(let championName in champions) {
            if(!champions.hasOwnProperty(championName)) continue;

            if(champions[championName]["id"] == name) {
                return champions[championName];
            }
        }
    },
    async getDraft(url, pwd, replacements) {

        // Format URL
        const splitted = url.split("/");
        let id;

        if(splitted.length > 1) {
            id = splitted[3];
        } else {
            id = splitted[0];
        }

        const config = {
            method: "post",
            url: "https://draftlol.dawe.gg/api/joinRoom",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            },
            data: {
                "roomId": id,
                "password": pwd
            }
        }

        // Fetch draftlol
        const result = await axios(config);

        if(result.status != 200) {
            return;
        }

        const returnObject = {
            bluePicks: [],
            redPicks: [],
            blueBans: [],
            redBans: []
        }

        // Get champions data
        for(let i = 0; i < result.data.roomState.bluePicks.length; i++) {
            returnObject.bluePicks.push(await sdl.getChampionByName((replacements.bluePicks[i]) ? replacements.bluePicks[i] : result.data.roomState.bluePicks[i]));
        }
        for(let i = 0; i < result.data.roomState.redPicks.length; i++) {
            returnObject.redPicks.push(await sdl.getChampionByName((replacements.redPicks[i]) ? replacements.redPicks[i] : result.data.roomState.redPicks[i]));
        }
        for(let i = 0; i < result.data.roomState.blueBans.length; i++) {
            returnObject.blueBans.push(await sdl.getChampionByName((replacements.blueBans[i]) ? replacements.blueBans[i] : result.data.roomState.blueBans[i]));
        }
        for(let i = 0; i < result.data.roomState.redBans.length; i++) {
            returnObject.redBans.push(await sdl.getChampionByName((replacements.redBans[i]) ? replacements.redBans[i] : result.data.roomState.redBans[i]));
        }

        return returnObject;

    }
}// https://draftlol.dawe.gg/NvxBNpz7
//https://cdn.communitydragon.org/latest/champion/${c}/splash-art/centered/skin/0