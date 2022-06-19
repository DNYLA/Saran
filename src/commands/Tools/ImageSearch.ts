import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class GetAvatar extends Command {
  constructor() {
    super('image', 'Tools', ['img']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    if (args.length === 0) return message.reply('Provide a query to search!');
    const query = args.join(' ');

    let results = client.getImage(query);

    if (!results)
      try {
        const data = await fetchQueryImages(query, 1);
        results = {
          images: data,
          query,
          currentPos: 0,
          requester: message.author.id,
        };
      } catch (err) {
        console.log(err);
        return message.channel.send('Daily free image search quota reached');
      }

    if (results.images.length === 0)
      return message.reply({ content: 'Cant Find any images!' });
    client.setImage(results);
    const firstImage = results.images[0];
    const imageEmbed = new MessageEmbed()
      .setImage(firstImage.url)
      // .setAuthor({ name: firstImage.title, url: firstImage.url })
      .setTitle(firstImage.snippet)
      .setURL(firstImage.url)
      .setFooter({
        text: `Page 1/${results.images.length} ∙ Requested by ${message.author.username}`,
      });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`image-backward-${query}`)
        .setLabel('<')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`image-forward-${query}`)
        .setLabel('>')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`image-delete-${query}`)
        .setLabel('X')
        .setStyle('DANGER')
    );

    const imgMessage = await message.channel.send({
      embeds: [imageEmbed],
      components: [row],
    });

    setTimeout(() => {
      imgMessage.edit({ components: [] });
    }, 60000);
  }
}
