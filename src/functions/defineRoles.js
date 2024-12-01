import { EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';
import { globals } from "../globals.js";

export const inhouseRoles = {
    async message(roles, updateRoles) {

        if(!roles) {
            roles = {
                top: 0,
                jgl: 0,
                mid: 0,
                bot: 0,
                sup: 0,
            };
        }

        let prefered = "";
        let wanted = "";
        let unwanted = "";

        priorities(roles.top, "toplaner");
        priorities(roles.jgl, "jungler");
        priorities(roles.mid, "midlaner");
        priorities(roles.bot, "AD carry");
        priorities(roles.sup, "support");

        function priorities(priority, role) {
            if(priority == 0) unwanted += (unwanted ? ", ": "") + role;
            else if(priority == 1) wanted += (wanted ? ", ": "") + role;
            else prefered = role;
        }

        // Build the message
        const embed = new EmbedBuilder()
        .setTitle(`Choix des roles voulus`)
        .setDescription(`Cliquez sur les boutons pour définir les roles qui pourront vous être attribués pendant cet In House.\nUne fois vos choix faits, cliquez sur \`Confirmer\` pour terminer votre inscription\n\nNote: si vous voulez changer votre role prioritaire, enlevez-le puis placez un autre role`)
        .setColor(globals.embed.colorMain)
        .setTimestamp()
        .addFields(
            { name: `Role prioritaire`, value: `${(prefered.length == 0) ? " " : prefered}`, inline: false },
            { name: `Roles secondaires`, value: `${(wanted.length == 0) ? " " : wanted}`, inline: false },
            { name: `Roles non joués`, value: `${(unwanted.length == 0) ? " " : unwanted}`, inline: false },
        )

        const bTop = new ButtonBuilder()
        .setCustomId(`inhouseRoles${globals.separator}top${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}${globals.separator}${updateRoles}`)
        .setLabel(`Toplaner`)
        .setStyle((roles.top == 0) ? ButtonStyle.Danger : ((roles.top == 1) ? ButtonStyle.Secondary : ButtonStyle.Primary));

        const bJgl = new ButtonBuilder()
        .setCustomId(`inhouseRoles${globals.separator}jgl${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}${globals.separator}${updateRoles}`)
        .setLabel(`Jungler`)
        .setStyle((roles.jgl == 0) ? ButtonStyle.Danger : ((roles.jgl == 1) ? ButtonStyle.Secondary : ButtonStyle.Primary));

        const bMid = new ButtonBuilder()
        .setCustomId(`inhouseRoles${globals.separator}mid${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}${globals.separator}${updateRoles}`)
        .setLabel(`Midlaner`)
        .setStyle((roles.mid == 0) ? ButtonStyle.Danger : ((roles.mid == 1) ? ButtonStyle.Secondary : ButtonStyle.Primary));

        const bBot = new ButtonBuilder()
        .setCustomId(`inhouseRoles${globals.separator}bot${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}${globals.separator}${updateRoles}`)
        .setLabel(`AD Carry`)
        .setStyle((roles.bot == 0) ? ButtonStyle.Danger : ((roles.bot == 1) ? ButtonStyle.Secondary : ButtonStyle.Primary));

        const bSup = new ButtonBuilder()
        .setCustomId(`inhouseRoles${globals.separator}sup${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}${globals.separator}${updateRoles}`)
        .setLabel(`Support`)
        .setStyle((roles.sup == 0) ? ButtonStyle.Danger : ((roles.sup == 1) ? ButtonStyle.Secondary : ButtonStyle.Primary));

        const rolesRow = new ActionRowBuilder()
        .addComponents(bTop, bJgl, bMid, bBot, bSup);

        const rolesConfirm = new ButtonBuilder()
        .setCustomId(`inhouseRegisterConfirm${globals.separator}${updateRoles}${globals.separator}${roles.top}${roles.jgl}${roles.mid}${roles.bot}${roles.sup}`)
        .setLabel(`Confirmer les roles`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

        const confirmRow = new ActionRowBuilder()
        .addComponents(rolesConfirm);

        return {
            embeds: [embed],
            components: [rolesRow, confirmRow],
        };
    }
}