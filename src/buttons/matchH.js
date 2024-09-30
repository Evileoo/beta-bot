import { EmbedBuilder } from 'discord.js';

export const button = {
    async execute(interaction, buttonData) {

        // Get the embed content
        let fetched = interaction.message.embeds[0].data;

        // If member doesn't get the pinged role
        if(!interaction.member.roles.cache.get(fetched.description.slice(3, -1))){
            return interaction.reply({
                content: `Tu n'as pas le rôle ${fetched.description}, tu ne peux donc par conséquent pas participer à ce match`,
                ephemeral: true
            });
        }

        // rebuild the embed
        const embed = new EmbedBuilder()
        .setTitle(fetched.title)
        .setDescription(fetched.description);

        // Edit the message field
        const field = fetched.fields[buttonData[1] - 1].value.split("\n");

        const availability = [];

        for(let i = 0; i < field.length; i++) {
            availability.push(field[i].split(":")[1]);
            availability[i] = (availability[i].length > 0) ? availability[i].split(", ") : [] ;
        }

        let found = false;
        let i = 0, j = 0;
        let memberTmp;
        for(let state of availability) {
            for(let member of state) {
                const memberId = member.slice(2, -1);

                if(memberId == interaction.user.id){
                    found = true;
                    memberTmp = member;

                    availability[i].splice(j, 1);

                    if(i == availability.length - 1){
                        availability[0].push(member);
                    } else {
                        availability[i+1].push(member);
                    }
                }
                
                if(found == true) break;

                j++;
            }

            if(found == true) break;

            i++;
            j = 0;
        }

        if(found == false) {
            availability[0].push(`<@${interaction.user.id}>`);
        }

        // Rebuild the string
        let newString = "";
        for(let i = 0; i < availability.length; i++) {
            newString += field[i].split(":")[0] + ":";

            for(let j = 0; j < availability[i].length; j++) {
                newString += availability[i][j];

                if(j < availability[i].length - 1) newString += ", ";
            }

            newString += "\n"
        }

        // Rebuild embed message
        for(let i = 0; i < fetched.fields.length; i++) {

            if(i == buttonData[1] - 1) {
                embed.addFields(
                    { name: `${fetched.fields[i].name}`, value: `${newString}`}
                );
            } else {
                embed.addFields(
                    { name: `${fetched.fields[i].name}`, value: `${fetched.fields[i].value}`}
                );
            }
        }

        // Edit the message
        await interaction.message.edit({
            embeds: [embed]
        });

        // Avoid "This interaction failed" message
        await interaction.deferUpdate();
    }
}