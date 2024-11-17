import {  } from 'discord.js';
import { globals } from '../globals.js';

export const button = {
    async execute(interaction, buttonData) {

        switch(buttonData[1]) {
            case "Création":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *Création* de l'InHouse\n## \`/inhouse paramétrage\`\nParamètres possibles:\n- \`rolemax\`: Nombre maximum de joueurs par role (mettre 0 si on ne souhaite aucune limite)\n- \`date\`: Date à laquelle se déroulera l'InHouse (l'écrire sous forme JJ/MM/AAAA)\n- \`salon\`: Salon dans lequel sera envoyé le message permettant aux membres de s'inscrire\n- \`elomin\`: Rang minimum requis en *Solo Queue* pour pouvoir participer à l'InHouse\n- \`elomax\`: Rang maximum requis en *Solo Queue* pour pouvoir participer à l'InHouse`,
                    ephemeral: true
                });
            case "Inscriptions":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *Inscriptions* de l'InHouse\n## \`/inhouse paramétrage\`\nParamètres possibles:\n- \`rolemax\`: Nombre maximum de joueurs par role (mettre 0 si on ne souhaite aucune limite)\n- \`date\`: Date à laquelle se déroulera l'InHouse (l'écrire sous forme JJ/MM/AAAA)\n- \`salon\`: Salon dans lequel sera envoyé le message permettant aux membres de s'inscrire`,
                    ephemeral: true
                });
            case "Génération":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *Génération* de l'InHouse\n`,
                    ephemeral: true
                });
            case "Résultats":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *Résultats* de l'InHouse\n`,
                    ephemeral: true
                });
            case "Vote":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *Vote* de l'InHouse\n`,
                    ephemeral: true
                });
            case "MVP":
                return await interaction.reply({
                    content: `# Liste des commandes pour l'étape *MVP* de l'InHouse\n`,
                    ephemeral: true
                });
            default:
                return await interaction.reply({
                    content: ``,
                    ephemeral: true
                });
        }
    }
}