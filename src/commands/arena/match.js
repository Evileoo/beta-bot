import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, ChannelType, AttachmentBuilder } from 'discord.js';
import { globals } from '../../globals.js';
import { sdl } from '../../functions/scrapDraftlol.js';
import puppeteer from 'puppeteer';

export const command = {
    data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Gestion des matchs")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("dispo")
        .setDescription("Demande les disponibilités des joueurs pour des horaires donnés")
        .addRoleOption( (option) =>
            option
            .setName("equipe")
            .setDescription("Role de l'équipe à mentionner")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire1")
            .setDescription("Proposition d'horaire n°1, format: 05/06/2023 15h30")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire2")
            .setDescription("Proposition d'horaire n°2, format: 05/06/2023 15h30")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire3")
            .setDescription("Proposition d'horaire n°3, format: 05/06/2023 15h30")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire4")
            .setDescription("Proposition d'horaire n°4, format: 05/06/2023 15h30")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire5")
            .setDescription("Proposition d'horaire n°5, format: 05/06/2023 15h30")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("adversaire")
            .setDescription("Nom de l'équipe adverse")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("type")
            .setDescription("Type de match")
            .addChoices(
                { name: `scrim`, value: `scrim` },
                { name: `showmatch`, value: `showmatch` },
                { name: `tournoi`, value: `tournoi` },
                { name: `match`, value: `match` },
            )
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("date")
        .setDescription("Envoie un message avec les horaires d'un match")
        .addRoleOption( (option) =>
            option
            .setName("equipe")
            .setDescription("Role de l'équipe à mentionner")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire")
            .setDescription("Heure du match, format: 05/06/2023 15h30")
            .setRequired(true)
        )
        .addChannelOption( (option) =>
            option
            .setName("channel")
            .setDescription("Channel vocal dans lequel les joueurs ont rendez vous")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("adversaire")
            .setDescription("Nom de l'équipe adverse")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("opgg")
            .setDescription("opgg de l'équipe adverse")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("type")
            .setDescription("Type de match")
            .addChoices(
                { name: `scrim`, value: `scrim` },
                { name: `showmatch`, value: `showmatch` },
                { name: `tournoi`, value: `match de tournoi` },
                { name: `match`, value: `match` },
            )
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("draftlol")
        .setDescription("Récupère le résultat d'une draft via draftlol")
        .addStringOption( (option) =>
            option
            .setName("url")
            .setDescription("url du draftlol")
            .setRequired(true)
        )
    )
    , async execute(interaction){

        const team = interaction.options.getRole("equipe");
        const opponent = interaction.options.getString("adversaire");
        const type = (interaction.options.getString("type")) ? interaction.options.getString("type") : `match`;

        const embed = new EmbedBuilder();
        const row = new ActionRowBuilder();
        
        switch(interaction.options.getSubcommand()){
            case "dispo":

                if(opponent) {
                    embed.setTitle(`Nouveau ${type} contre ${opponent}`);
                } else {
                    embed.setTitle(`Nouveau ${type}`);
                }

                let amount = 0;

                for(let i = 1; i <= 5; i++){
                    const horaire = interaction.options.getString(`horaire${i}`);
                    if(horaire) {
                        amount++;

                        try {
                            const datetime = horaire.split(" ");
                            const dmy = datetime[0].split("/");
                            const hm = datetime[1].split("h");

                            if(hm.length == 1) hm.push(0);

                            const matchDateTime = Math.floor(new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime() / 1000);

                            // Add the field in embed
                            embed.addFields(
                                { name: `Horaire n°${amount} : <t:${matchDateTime}:f>`, value: `Disponible:\nPas disponible:\nPeut-être:\n` }
                            )

                            // Create the button
                            const button = new ButtonBuilder()
                            .setCustomId(`matchH${globals.separator}${amount}`)
                            .setLabel(`Horaire ${amount}`)
                            .setStyle(ButtonStyle.Success);

                            row.addComponents(button);
                        } catch(error) {
                            return interaction.reply({
                                content: `date mal saisie.\nLe format de la date doit ressembler à ceci : \`05/06/2023 15h30\``,
                                ephemeral: true
                            });
                        }
                    }
                }

                await interaction.channel.send({
                    embeds: [embed],
                    components: [row],
                    content: `<@&${team.id}>`
                });

                await interaction.reply({
                    content: `demande de disponibilités créée`,
                    ephemeral: true
                });

                break;
            case "date":

                const horaire = interaction.options.getString("horaire");
                const opgg = interaction.options.getString("opgg");
                const channel = interaction.options.getChannel("channel");

                if(channel.ChannelType != ChannelType.Voice){
                    return interaction.reply({
                        content: `Le channnel fourni n'est pas un channnel vocal`,
                        ephemeral: true
                    });
                }

                const datetime = horaire.split(" ");
                const dmy = datetime[0].split("/");
                const hm = datetime[1].split("h");

                if(hm.length = 1) hm.push(0);

                const matchDateTime1 = new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime();
                const matchDateTime2 = Math.floor(new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime() / 1000);

                embed
                .addFields(
                    {name: `${type} le <t:${matchDateTime2}:f>`, value: `Présence en vocal 30 minutes avant le début demandée pour préparer la draft`}
                )

                if(opgg){
                    embed.addFields({name: `opgg des adversaires`, value: `[lien](${opgg})`});

                    const button = new ButtonBuilder()
                    .setCustomId(`opgg${globals.separator}edit`)
                    .setLabel(`Modifier l'opgg`)
                    .setStyle(ButtonStyle.Secondary);
                
                    row.addComponents(button);
                } else {
                    const button = new ButtonBuilder()
                    .setCustomId(`opgg${globals.separator}add`)
                    .setLabel(`Ajouter l'opgg`)
                    .setStyle(ButtonStyle.Primary);
                
                    row.addComponents(button);
                }

                let eventDescriptionMessage = "";
                if(opponent) {
                    embed.setTitle(`Nouveau ${type} contre ${opponent}`);
                    eventDescriptionMessage = `${type} contre ${opponent}`
                } else {
                    embed.setTitle(`Nouveau ${type}`);
                }

                const event = new GuildScheduledEventManager(interaction.guild);

                const newEvent = await event.create({
                    name: `${type} de ${team.name}`,
                    scheduledStartTime: matchDateTime1,
                    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                    entityType: GuildScheduledEventEntityType.Voice,
                    description: `${eventDescriptionMessage}`,
                    channel: channel.id
                });

                embed.addFields({ name: `Évènement discord`, value: `[lien](https://discord.com/events/${interaction.guild.id}/${newEvent.id})` });

                await interaction.channel.send({
                    embeds: [embed],
                    components: [row],
                    content: `<@&${team.id}>`
                });


                await interaction.reply({
                    content: `match créé`,
                    ephemeral: true
                });


                break;
            case "draftlol":
                // https://draftlol.dawe.gg/NvxBNpz7

                const file = "draft.png";

                const url = interaction.options.getString("url");

                const result = await sdl.getResults(url);

                //console.log(result);
                break;

                await interaction.reply({
                    content: `Envoi en cours`,
                    ephemeral: true
                });
                
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });

                await page.goto(url, { waitUntil: 'networkidle2' });

                await page.screenshot({ path: file });

                const image = new AttachmentBuilder(file, { name: file });

                await interaction.channel.send({
                    files: [image],
                    ephemeral: true
                });

                browser.close();



                break;
            default:
                return interaction.reply({
                    content: `Unkown interaction : ${interaction.options.getSubcommand()}`,
                    ephemeral: true
                });
        }
    }
}