import { Interaction, EmbedBuilder } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('interactionCreate');
  }

  async run(client: DiscordClient, interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('image')) {
      await interaction.reply({
        content: 'Invalid Interaction!',
        ephemeral: true,
      });
      return;
    }

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
      await interaction.reply({
        content: 'Request Timedout!',
        ephemeral: true,
      });
      console.log('no result');
      return;
    }

    if (results.requester !== interaction.user.id) {
      await interaction.reply({
        content: 'Only the person who requested the image can interact!',
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId.startsWith('image-delete')) {
      const embed = new EmbedBuilder().setTitle('Request Deleted');
      await interaction.update({ embeds: [embed], components: [] });
      return;
    }

    let newPos = results.currentPos;

    if (forward) {
      newPos++;
      if (newPos > results.images.length - 1) {
        await interaction.reply({
          content: 'No More Images!',
          ephemeral: true,
        });
        return;
      }
    } else {
      newPos--;
      if (newPos < 0) {
        await interaction.reply({
          content: 'Cant go back!',
          ephemeral: true,
        });
        return;
      }
    }

    try {
      const image = results.images[newPos];
      const imageEmbed = new EmbedBuilder()
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
      await interaction.reply({
        content: 'Undiagnosable error occred',
        ephemeral: true,
      });
    }
  }
}
