import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { globals } from '../globals.js';
import { db } from '../connections/database.js';

export const button = {
    async execute(interaction, buttonData) {

        // Send the embed to the registration channel
        const inhouse = await db.query(`SELECT * FROM inhouse_session ORDER BY id DESC LIMIT 1`);

        const registerChannel = interaction.guild.channels.cache.get(inhouse[0].register_channel);

        const dmy = inhouse[0].date_start.split("/");
        const dateTimeDiscord = Math.floor(new Date(dmy[2], dmy[1] - 1, dmy[0]).getTime() / 1000);

        const registrationEmbed = new EmbedBuilder()
        .setTitle(`Inscriptions In House`)
        .setDescription(`Pour vous inscrire à l'inhouse, il faut que vous ayez au préalable lié un compte Riot au bot via la commande \`/compte ajouter\`.\nRenseignez tous les comptes sur lesquels vous êtes susceptibles de jouer puis, faites la commande \`/compte principal\` pour définir votre compte principal.\nVeuillez ensuite cliquer sur **s'inscrire** et choisissez vos roles pour l'InHouse.`)
        .setTimestamp()
        .setColor(globals.embed.colorMain)
        .addFields(
            { name: `Date`, value: `<t:${dateTimeDiscord}:D>`, inline: true },
            { name: `Nombre d'inscrits`, value: `0`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Rang minimum requis`, value: `${inhouse[0].elomin}`, inline: true },
            { name: `Rang maximum requis`, value: `${inhouse[0].elomax}`, inline: true },
        );

        const registerButton = new ButtonBuilder()
        .setCustomId(`inhouseRegister`)
        .setLabel(`S'inscrire`)
        .setStyle(ButtonStyle.Success);

        const rolesButton = new ButtonBuilder()
        .setCustomId(`inhouseChangeRoles`)
        .setLabel(`Changer mes roles`)
        .setStyle(ButtonStyle.Primary);

        const unregisterButton = new ButtonBuilder()
        .setCustomId(`inhouseUnregister`)
        .setLabel(`Se désinscrire`)
        .setStyle(ButtonStyle.Danger);

        const registerRow = new ActionRowBuilder()
        .addComponents(registerButton, rolesButton, unregisterButton);

        const registerMessage = await registerChannel.send({
            embeds: [registrationEmbed],
            components: [registerRow]
        });

        await db.query(`UPDATE inhouse_session SET register_message = '${registerMessage.id}' ORDER BY id DESC LIMIT 1`);

        // Update the session embed
        const panelChannel = interaction.guild.channels.cache.get(inhouse[0].panel_channel);
        const message = await panelChannel.messages.fetch(inhouse[0].panel_message);

        const sessionEmbed = new EmbedBuilder()
        .setTitle(`In House communautaire n°${inhouse[0].id}`)
        .setDescription(`Etapes:\nCréation\n**__Inscriptions__**\nGénération des équipes\nRésultats des matchs\nChoix des MVP\nVote du MVP\nClôture`)
        .setTimestamp()
        .setColor(globals.embed.colorMain)
        .addFields(
            { name: `Date`, value: `<t:${dateTimeDiscord}:D>`, inline: true },
            { name: `Nombre d'inscrits`, value: `0`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Rang minimum requis`, value: `${inhouse[0].elomin}`, inline: true },
            { name: `Rang maximum requis`, value: `${inhouse[0].elomax}`, inline: true },
            { name: `\t`, value: `\t`, inline: false },
            { name: `Top`, value: `0`, inline: true },
            { name: `Jgl`, value: `0`, inline: true },
            { name: `Mid`, value: `0`, inline: true },
            { name: `Bot`, value: `0`, inline: true },
            { name: `Sup`, value: `0`, inline: true },
        );

        const sessionNextStep = new ButtonBuilder()
        .setCustomId(`inhouseRegistrationClose`)
        .setLabel(`Clôturer les inscriptions`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

        const sessionCommands = new ButtonBuilder()
        .setCustomId(`inhouseCommands${globals.separator}Inscriptions`)
        .setLabel(`Commandes`)
        .setStyle(ButtonStyle.Secondary);

        const inhouseStop = new ButtonBuilder()
        .setCustomId(`inhouseStop${globals.separator}first`)
        .setLabel(`Annuler l'InHouse`)
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
        .addComponents(sessionNextStep, sessionCommands, inhouseStop);

        const a = await message.edit({
            embeds: [sessionEmbed],
            components: [row]
        });

        await interaction.deferUpdate();
    }
}