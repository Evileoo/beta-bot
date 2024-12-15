import axios from "axios";
import Canvas from '@napi-rs/canvas';

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
            teamName: {
                blue: result.data.roomState.blueName,
                red: result.data.roomState.redName
            },
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

    },
    async generateCanvas(data) {
        // Consts and vars
        const canW = 5000, canH = 1500;
        const splashW = 1280, splashH = 720;

        const pickCropStartW = splashW / 3, pickCropStartH = 0;
        const pickCropAreaW = splashW / 3, pickCropAreaH = splashH * 0.8;
        const pickMarginTop = canH - pickCropAreaH;
        const pickScaleW = pickCropAreaW, pickScaleH = pickCropAreaH;
        let pickMarginLeft = 0, pickMarginRight = canW - pickScaleW;
        const picksBreak = canW / 50, picksSeparator = canW / 1000 + pickScaleW;

        const banCropStartW = splashW / 3, banCropStartH = 0;
        const banCropAreaW = splashW / 3, banCropAreaH = splashW / 3;
        const banMarginTop = canH - pickCropAreaH - banCropAreaH - canH / 100;
        const banScaleW = banCropAreaW / 1.5, banScaleH = banCropAreaH / 1.5;
        let banMarginLeft = 0, banMarginRight = canW - banScaleW;
        const banBreak = canW / 50, bansSeparator = canW / 900 + banScaleW;
        
        let counter;
        const emptySplashHex = "#000000";

        // Generate canvas and context
        const canvas = Canvas.createCanvas(canW, canH);
        const ctx = canvas.getContext("2d");

        // Create canvas background
        ctx.fillStyle = "#2f3136";
        ctx.fillRect(0, 0, canW, canH);

        // Add team names
        ctx.fillStyle = "#ffffff";
        ctx.font = "200px sans-serif";
        ctx.fillText(
            data.teamName.blue, 
            0, 
            ctx.measureText(data.teamName.blue).emHeightAscent
        );
        ctx.fillText(
            data.teamName.red, 
            canW - ctx.measureText(data.teamName.red).width, 
            ctx.measureText(data.teamName.red).emHeightAscent
        );

        // Add blue picks LoL splashs in canvas
        counter = 0;
        for(let champion of data.bluePicks) {
            if(counter == 3) {
                pickMarginLeft += picksBreak;
            }
            counter++;

            if(champion != undefined) {
                const url = `https://cdn.communitydragon.org/latest/champion/${champion.key}/splash-art/centered/skin/0`
                const selectedChamp = await Canvas.loadImage(url);

                ctx.drawImage(
                    selectedChamp, // image
                    pickCropStartW, pickCropStartH, // W/H crop start
                    pickCropAreaW, pickCropAreaH, // W/H area of crop
                    pickMarginLeft, pickMarginTop, // place in canvas
                    pickScaleW, pickScaleH // W/H scale
                );
            } else {
                ctx.fillStyle = emptySplashHex
                ctx.fillRect(pickMarginLeft, pickMarginTop, pickCropAreaW, pickCropAreaH);
            }

            pickMarginLeft += picksSeparator;
        }

        // Add red picks LoL splashs in canvas
        counter = 0;
        for(let champion of data.redPicks) {
            if(counter == 3) {
                pickMarginRight -= picksBreak;
            }
            counter++;

            if(champion != undefined) {
                const url = `https://cdn.communitydragon.org/latest/champion/${champion.key}/splash-art/centered/skin/0`
                const selectedChamp = await Canvas.loadImage(url);

                ctx.drawImage(
                    selectedChamp, // image
                    pickCropStartW, pickCropStartH, // W/H crop start
                    pickCropAreaW, pickCropAreaH, // W/H area of crop
                    pickMarginRight, pickMarginTop, // place in canvas
                    pickScaleW, pickScaleH // W/H scale
                );
            } else {
                ctx.fillStyle = emptySplashHex
                ctx.fillRect(pickMarginRight, pickMarginTop, pickCropAreaW, pickCropAreaH);
            }

            pickMarginRight -= picksSeparator;
        }

        // Add blue bans LoL splashs in canvas
        counter = 0;
        for(let champion of data.blueBans) {
            if(counter == 3) {
                banMarginLeft += banBreak;
            }
            counter++;

            if(champion != undefined) {
                const url = `https://cdn.communitydragon.org/latest/champion/${champion.key}/splash-art/centered/skin/0`
                const selectedChamp = await Canvas.loadImage(url);

                ctx.drawImage(
                    selectedChamp, // image
                    banCropStartW, banCropStartH, // W/H crop start
                    banCropAreaW, banCropAreaH, // W/H area of crop
                    banMarginLeft, banMarginTop, // place in canvas
                    banScaleW, banScaleH // W/H scale
                );
            } else {
                ctx.fillStyle = emptySplashHex
                ctx.fillRect(banMarginLeft, banMarginTop, banScaleW, banScaleH);
            }

            banMarginLeft += bansSeparator;
        }

        // Add red bans LoL splashs in canvas
        counter = 0;
        for(let champion of data.redBans) {
            if(counter == 3) {
                banMarginRight -= banBreak;
            }
            counter++;

            if(champion != undefined) {
                const url = `https://cdn.communitydragon.org/latest/champion/${champion.key}/splash-art/centered/skin/0`
                const selectedChamp = await Canvas.loadImage(url);

                ctx.drawImage(
                    selectedChamp, // image
                    banCropStartW, banCropStartH, // W/H crop start
                    banCropAreaW, banCropAreaH, // W/H area of crop
                    banMarginRight, banMarginTop, // place in canvas
                    banScaleW, banScaleH // W/H scale
                );
            } else {
                ctx.fillStyle = emptySplashHex
                ctx.fillRect(banMarginRight, banMarginTop, banScaleW, banScaleH);
            }

            banMarginRight -= bansSeparator;
        }


        return canvas;
    }
}// https://draftlol.dawe.gg/NvxBNpz7
//https://cdn.communitydragon.org/latest/champion/${c}/splash-art/centered/skin/0