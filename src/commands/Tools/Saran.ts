/* eslint-disable @typescript-eslint/no-var-requires */
// import https from https;
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
} from 'discord.js';
import { AggregateSteps } from 'redis';
import { getRedditMediaURLS, getTikTokMediaURLS } from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import urlRegex from 'url-regex';
import { parse as parseUrl } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
// const instagramGetUrl = require('instagram-url-direct');
// import { downloader as Downloader } from 'instagram-url-downloader';

// type InstagramLinkType = {
//   results_number: number;
//   url_list: string[];
// };

export default class Sanar extends Command {
  constructor() {
    super('saran', {
      invalidUsage: `Do ,saran <link>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [{ name: 'medaiUrl', type: ArgumentTypes.FULL_SENTANCE }],
    });
  }

  // *
  // * Disabled due to issues with the package.
  // *
  // async run(message: Message, args: { videoUrl: string }) {
  //   return message.reply('Command is currently being reworked.');
  //   // const links: InstagramLinkType = await instagramGetUrl(args.videoUrl);

  //   // if (links.url_list.length === 0)
  //   //   return message.reply(
  //   //     'No Media found (If this is a valid link then this error can occur when instagram rate limits requests)'
  //   //   );
  //   // const { data, headers } = await axios.get(links.url_list[0], {
  //   //   responseType: 'arraybuffer',
  //   // });
  //   // const buffer = Buffer.from(data, 'utf-8');
  //   // const contentType = headers['content-type'];

  //   // if (!contentType || !contentType.includes('image'))
  //   //   return message.reply('No Media found!');

  //   // if (contentType.includes('image')) {
  //   //   const fileType = contentType.includes('jpeg') ? 'jpg' : 'png';
  //   //   const title = `image.${fileType}`;

  //   //   const attachment = new AttachmentBuilder(buffer, { name: title });
  //   //   const embed = new EmbedBuilder()
  //   //     .setTitle(title)
  //   //     .setImage(`attachment://${title}`);
  //   //   await message.channel.send({ embeds: [embed], files: [attachment] });
  //   //   message.channel.delete();
  //   // }
  //   // console.log(contentType);
  //   // if (args.length === 0) return message.reply('Provide a URL to scrape!');
  //   // const url = 'https://www.instagram.com/p/Cdc02LTD0Fo/';

  //   // const html = await axios.get(url);
  //   // console.log(html);
  //   // // calls cheerio to process the html received
  //   // const $ = cheerio.load(html.data);
  //   // // searches the html for the videoString
  //   // const videoString = $("meta[property='og:video']").attr('content');
  //   // // returns the videoString

  //   // console.log(videoString);
  //   // // message.reply(videoString);
  // }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(message: Message, args: { medaiUrl: string }) {
    // let tag = '',
    //   post = '';
    // let tagPref = 'explore/tags/';
    const url = args.medaiUrl;
    const hostName = parseUrl(url).hostname.toLowerCase();
    console.log(hostName);
    if (hostName.includes('reddit')) {
      return getRedditMedia(message, url);
    } else if (hostName.includes('tiktok')) {
      getTikTokMedia(message, url);
    } else {
      return message.reply('Currently only Reddit links are supported!');
    }
  }
}

async function getRedditMedia(message: Message, url: string) {
  console.log('Reddit');
  const { urls, title, subreddit, upvotes } = await getRedditMediaURLS(url);
  if (!urls || urls.length === 0)
    return message.reply('No media could be found!');
  if (urls[0].includes('v.redd.it'))
    return message.reply('Videos not supported yet!');
  console.log(urls);

  const generateEmbed = (pos: number) => {
    return (
      new EmbedBuilder()
        .setImage(urls[pos])
        // .setAuthor({ name: firstImage.title, url: firstImage.url })
        .setTitle(`${title} - r/${subreddit}`)
        .setURL(url)
        .setFooter({
          iconURL:
            'https://external-preview.redd.it/iDdntscPf-nfWKqzHRGFmhVxZm4hZgaKe5oyFws-yzA.png?auto=webp&s=38648ef0dc2c3fce76d5e1d8639234d8da0152b2',
          text: `Page ${pos + 1}/${
            urls.length
          } ∙ Upvotes: ${upvotes} ∙ Requested by ${message.author.username}`,
        })
    );
  };

  const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
    new ButtonBuilder()
      .setCustomId(`media-backward`)
      .setLabel('<')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`media-forward`)
      .setLabel('>')
      .setStyle(ButtonStyle.Primary)
  );
  // new ButtonBuilder()
  //   .setCustomId(`media-delete`)
  //   .setLabel('X')
  //   .setStyle(ButtonStyle.Danger)
  // );

  const embedMessage = await message.channel.send({
    embeds: [generateEmbed(0)],
    components: urls.length > 1 ? [row] : [],
  });

  message.delete();

  if (urls.length === 1) return;

  let curPos = 0;

  const collector = embedMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 90000,
  });

  collector.on('collect', (interaction) => {
    if (interaction.user.id !== message.author.id) {
      interaction.reply({
        content: 'Only the person who requested the image can interact!',
        ephemeral: true,
      });
      return;
    }

    const forward = interaction.customId === 'media-forward' ? true : false;
    const newPos = forward ? curPos + 1 : curPos - 1;
    if (newPos > urls.length - 1 || newPos < 0) {
      const message =
        newPos > urls.length - 1 ? 'Cant go forward!' : 'Cant go back!';

      interaction.reply({
        content: message,
        ephemeral: true,
      });
      return;
    }
    console.log(newPos);
    try {
      interaction.update({ embeds: [generateEmbed(newPos)] });
      curPos = newPos;
    } catch (err) {
      interaction.reply({
        content: 'Undiagnosable error occred',
        ephemeral: true,
      });
    }
  });

  collector.on('end', (collected) => {
    embedMessage.edit({ embeds: [generateEmbed(curPos)], components: [] });
  });
}

async function getTikTokMedia(message: Message, url: string) {
  const { video, videoUrl } = await dlpanda(url);
  const id = crypto.randomBytes(4).toString('hex');
  const attachment = new AttachmentBuilder(video, {
    name: `saran_${id}.mp4`,
  });

  console.log(attachment);
  try {
    await message.channel.send({ files: [attachment] });
    new EmbedBuilder()
      // .setAuthor({ name: firstImage.title, url: firstImage.url })
      .setTitle(`TikTok Video`)
      .setURL(url)
      .setFooter({
        iconURL:
          'https://external-preview.redd.it/iDdntscPf-nfWKqzHRGFmhVxZm4hZgaKe5oyFws-yzA.png?auto=webp&s=38648ef0dc2c3fce76d5e1d8639234d8da0152b2',
        text: `Requested by ${message.author.username}#${message.author.discriminator}`,
      });
    await message.delete();
  } catch (err) {
    return message.reply('File Too Large!');
  }

  console.log(videoUrl);
}

async function dlpanda(url) {
  const { data } = await axios.get(`https://dlpanda.com/?url=${url}`);

  const $ = cheerio.load(data);
  const test = $('tiktok-cqzvte-StrongText e1hk3hf92');
  const div = $('video').children();
  const videoUrl = div.attr('src');

  console.log(test.html());
  const res = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  return { video: res.data, videoUrl };
}
