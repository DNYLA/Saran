import { PrismaClient } from '@prisma/client';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';
import { WebSearchImages } from '../../utils/types';

export default class GetAvatar extends Command {
  constructor() {
    super('image', 'Tools', ['img']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    if (args.length === 0) return message.reply('Provide a query to search!');
    const query = args.join(' ');

    let results = client.getImage(query);

    // let results: WebSearchImages = {
    //   query: 'test',
    //   currentPos: 0,
    //   requester: message.author.id,
    //   images: [
    //     {
    //       url: 'https://sm.pcmag.com/t/pcmag_au/news/l/lime-tests/lime-tests-citra-electric-motorbike-in-long-beach_r69j.1200.jpg',
    //       height: 675,
    //       width: 1200,
    //       thumbnail:
    //         'https://rapidapi.usearch.com/api/thumbnail/get?value=7322731056287538692',
    //       title: 'Lime Tests Citra Electric Motorbike in Long Beach',
    //     },
    //     {
    //       url: 'https://thewell.unc.edu/wp-content/uploads/sites/1007/2022/01/COVID-test.jpg',
    //       height: 675,
    //       width: 1200,
    //       thumbnail:
    //         'https://rapidapi.usearch.com/api/thumbnail/get?value=661206131314380158',
    //       title:
    //         'Do home COVID-19 test results guarantee safety? - The Well : The Well',
    //     },
    //   ],
    // };

    if (!results)
      try {
        const { data } = await fetchQueryImages(query, 1);
        results = {
          images: data.value,
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
      .setTitle(firstImage.title)
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
