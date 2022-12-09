import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
// import reverseImageSearch from 'node-reverse-image-search';

export default class ImageSearch extends Command {
  constructor() {
    super('reverseImage', {
      aliases: [
        'revImage',
        'ri',
        'reversei',
        'rImage',
        'rImg',
        'rimg',
        'reverseimg',
      ],
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Do ,img <Query>',
      // arguments: [
      //   {
      //     name: 'query',
      //     optional: true,
      //     type: ArgumentTypes.FULL_SENTANCE,
      //   },
      // ],
    });
  }

  // *Disabled due to package having a compatibility issue with linux.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(message: Message, args: { query?: string }) {
    return message.reply('Currently Disabled.');
    // const { query } = args;

    // let imageToSearch = query;

    // if (!query || query === '') {
    //   //Check for attachments
    //   if (message.attachments.size > 0) {
    //     imageToSearch = message.attachments.first().url;
    //   } else if (message.reference) {
    //     console.log('There isa  reply');
    //     const fetchedMessage = await message.channel.messages.fetch(
    //       message.reference.messageId
    //     );

    //     if (fetchedMessage && fetchedMessage.attachments.size > 0) {
    //       imageToSearch = fetchedMessage.attachments.first().url;
    //     }
    //   }
    // }

    // if (!imageToSearch) {
    //   return message.reply('No valid Image URL or Attachment provided.');
    // }

    // const cb = async (results: { url: string; title: string }[]) => {
    //   if (!results || results.length === 0)
    //     return message.reply('Unable to find any data on this image!');

    //   const embed = new EmbedBuilder()
    //     // .setAuthor({ name: firstImage.title, url: firstImage.url })
    //     .setTitle('Reverse Image:')
    //     .setDescription(`[Jump To Image](${message.url})`);

    //   let validCounter = 0;
    //   for (let i = 0; i < 5; i++) {
    //     if (i > results.length - 1) break;
    //     const image = results[i];
    //     console.log(image);
    //     if (!image.title || !image.url) continue;
    //     embed.addFields({ name: image.title, value: image.url });
    //     validCounter++;
    //   }

    //   embed.setFooter({
    //     text: `Total Results: ${validCounter} ∙ Requested by ${message.author.username}`,
    //   });
    //   // console.log(fields);
    //   // embed.addFields(fields);

    //   await message.channel.send({
    //     embeds: [embed],
    //   });
    // };

    // reverseImageSearch(imageToSearch, cb);
  }
}
