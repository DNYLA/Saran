import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export type SearchQueryArgs = {
  query: string;
};

export default class ImageSearch extends Command {
  constructor() {
    super('image', {
      aliases: ['img'],
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Do ,img <Query>',
      // args: [
      //   {
      //     name: 'query',
      //     type: ArgumentTypes.FULL_SENTANCE,
      //   },
      // ],
    });
  }

  async run(message: Message, args: string[], argums: SearchQueryArgs) {
    const client = message.client as DiscordClient;
    return message.reply('Command is disabled');
    // if (args.length === 0) return message.reply('Provide a query to search!');
    // const { query } = argums;

    // let results = client.getImage(query);

    // if (!results)
    //   try {
    //     const data = await fetchQueryImages(query, 1);
    //     results = {
    //       images: data,
    //       query: query,
    //       currentPos: 0,
    //       requester: message.author.id,
    //     };
    //   } catch (err) {
    //     console.log(err);
    //     return message.channel.send('Daily free image search quota reached');
    //   }

    // if (results.images.length === 0)
    //   return message.reply({ content: 'Cant Find any images!' });
    // client.setImage(results);
    // const firstImage = results.images[0];
    // const imageEmbed = new MessageEmbed()
    //   .setImage(firstImage.url)
    //   // .setAuthor({ name: firstImage.title, url: firstImage.url })
    //   .setTitle(firstImage.snippet)
    //   .setURL(firstImage.url)
    //   .setFooter({
    //     text: `Page 1/${results.images.length} ∙ Requested by ${message.author.username}`,
    //   });

    // const row = new MessageActionRow().addComponents(
    //   new MessageButton()
    //     .setCustomId(`image-backward-${query}`)
    //     .setLabel('<')
    //     .setStyle('PRIMARY'),
    //   new MessageButton()
    //     .setCustomId(`image-forward-${query}`)
    //     .setLabel('>')
    //     .setStyle('PRIMARY'),
    //   new MessageButton()
    //     .setCustomId(`image-delete-${query}`)
    //     .setLabel('X')
    //     .setStyle('DANGER')
    // );

    // const imgMessage = await message.channel.send({
    //   embeds: [imageEmbed],
    //   components: [row],
    // });

    // setTimeout(() => {
    //   imgMessage.edit({ components: [] });
    // }, 60000);
  }
}
