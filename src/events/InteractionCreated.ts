import { Interaction, MessageEmbed } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('interactionCreate');
  }

  async run(client: DiscordClient, interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('image'))
      return interaction.reply({
        content: 'Invalid Interaction!',
        ephemeral: true,
      });

    let query;
    let forward = true;
    if (interaction.customId.startsWith('image-forward')) {
      query = interaction.customId.split('image-forward-')[1];
    } else if (interaction.customId.startsWith('image-backward')) {
      query = interaction.customId.split('image-backward-')[1];
      forward = false;
    } else {
      query = interaction.customId.split('image-delete-')[1];
    }

    const results = client.getImage(query);

    if (!results) {
      return interaction.reply({
        content: 'Request Timedout!',
        ephemeral: true,
      });
    }

    if (results.requester !== interaction.user.id) {
      return interaction.reply({
        content: 'Only the person who requested the image can interact!',
        ephemeral: true,
      });
    }

    if (interaction.customId.startsWith('image-delete')) {
      const embed = new MessageEmbed().setTitle('Request Deleted');
      return interaction.update({ embeds: [embed], components: [] });
    }

    let newPos = results.currentPos;

    if (forward) {
      newPos++;
      if (newPos > results.images.length - 1)
        return interaction.reply({
          content: 'No More Images!',
          ephemeral: true,
        });
    } else {
      newPos--;
      if (newPos < 0)
        return interaction.reply({
          content: 'Cant go back!',
          ephemeral: true,
        });
    }

    try {
      const image = results.images[newPos];
      const imageEmbed = new MessageEmbed()
        .setImage(image.link)
        .setTitle(image.title)
        .setURL(image.link)
        .setFooter({
          text: `Page ${newPos + 1}/${results.images.length} ∙ Requested by ${
            interaction.user.username
          }`,
        });

      interaction.update({ embeds: [imageEmbed] });
      results.currentPos = newPos;
      client.setImage(results);
    } catch (err) {
      return interaction.reply({
        content: 'Undiagnosable error occred',
        ephemeral: true,
      });
    }
  }
}
