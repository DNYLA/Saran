import axios from 'axios';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
const instagramGetUrl = require('instagram-url-direct');
// import { downloader as Downloader } from 'instagram-url-downloader';
const Downloader = require('instagram-url-downloader').default;

type InstagramLinkType = {
  results_number: number;
  url_list: string[];
};

export default class Sanar extends Command {
  constructor() {
    super('saran', {
      invalidUsage: `Do ,saran <link>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [{ name: 'videoUrl', type: ArgumentTypes.FULL_SENTANCE }],
    });
  }

  async run(message: Message, args: { videoUrl: string }) {
    let links: InstagramLinkType = await instagramGetUrl(args.videoUrl);
    console.log(links);

    if (links.url_list.length === 0)
      return message.reply(
        'No Media found (If this is a valid link then this error can occur when instagram rate limits requests)'
      );
    const url = links.url_list[0];
    const { data, headers } = await axios.get(links.url_list[0], {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(data, 'utf-8');
    const contentType = headers['content-type'];

    if (!contentType || !contentType.includes('image'))
      return message.reply('No Media found!');

    if (contentType.includes('image')) {
      const fileType = contentType.includes('jpeg') ? 'jpg' : 'png';
      const title = `image.${fileType}`;

      const attachment = new MessageAttachment(buffer, title);
      const embed = new MessageEmbed()
        .setTitle(title)
        .setImage(`attachment://${title}`);
      await message.channel.send({ embeds: [embed], files: [attachment] });
      message.channel.delete();
    } else {
    }
    console.log(contentType);
    // if (args.length === 0) return message.reply('Provide a URL to scrape!');
    // const url = 'https://www.instagram.com/p/Cdc02LTD0Fo/';

    // const html = await axios.get(url);
    // console.log(html);
    // // calls cheerio to process the html received
    // const $ = cheerio.load(html.data);
    // // searches the html for the videoString
    // const videoString = $("meta[property='og:video']").attr('content');
    // // returns the videoString

    // console.log(videoString);
    // // message.reply(videoString);
  }
}
