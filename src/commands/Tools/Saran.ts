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
import {
  getInstagramMediaURLS,
  getRedditMediaURLS,
  getTikTokMediaURLS,
} from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import urlRegex from 'url-regex';
import { parse as parseUrl } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { CONSTANTS } from '../../utils/constants';
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
    } else if (hostName.includes('instagram')) {
      getInstagramMedia(message, url);
    } else {
      return message.reply('Link not supported!');
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

async function getInstagramMedia(message: Message, url: string) {
  const data = await getInstagramMediaURLS(url);

  const generateEmbed = (pos: number) => {
    let embed = new EmbedBuilder()
      .setAuthor({
        name: data.author.fullName,
        iconURL: data.author.avatarUrl,
      })
      // .setAuthor({ name: firstImage.title, url: firstImage.url })
      .setTitle(data.author.displayName)
      .setURL(url)
      .setFooter({
        iconURL:
          'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
        text: `Page ${pos + 1}/${
          data.media.length === 0 ? 1 : data.media.length
        } ∙ Requested by ${message.author.username}#${
          message.author.discriminator
        }`,
      });
    if (data.media.length > 0) embed = embed.setImage(data.media[pos].url);
    return embed;
  };

  let isTooLarge = false;
  console.log(data.media);
  console.log(data.media.length);
  if (data.media.length === 0) return;

  const tempMedia = [...data.media]; //Since we splice in the function below we need to use a temp buffer

  for (let i = 0; i < tempMedia.length; i++) {
    const item = tempMedia[i];
    if (!item.isVideo) continue;

    try {
      const res = await axios({
        url: item.url,
        method: 'GET',
        responseType: 'arraybuffer',
      });
      const id = crypto.randomBytes(4).toString('hex');
      const attachment = new AttachmentBuilder(res.data, {
        name: `saran_${id}.mp4`,
      });
      data.media = data.media.filter((media) => media.url !== item.url);
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      isTooLarge = true;
    }
  }

  if (isTooLarge) {
    await message.reply('Video file is too large!');
  }

  if (data.media.length <= 1) {
    await message.channel.send({ embeds: [generateEmbed(0)] });
    return;
  }

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

  const embedMessage = await message.channel.send({
    embeds: [generateEmbed(0)],
    components: [row],
  });

  let curPos = 0;

  const collector = embedMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 90000,
  });

  collector.on('collect', (interaction) => {
    if (interaction.user.id !== message.author.id) {
      interaction.reply({
        content: 'Only the person who requested the post can interact!',
        ephemeral: true,
      });
      return;
    }

    const forward = interaction.customId === 'media-forward' ? true : false;
    const newPos = forward ? curPos + 1 : curPos - 1;
    if (newPos > data.media.length - 1 || newPos < 0) {
      const message =
        newPos > data.media.length - 1 ? 'Cant go forward!' : 'Cant go back!';

      interaction.reply({
        content: message,
        ephemeral: true,
      });
      return;
    }

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
  const stats = await fetchInfo(url);
  const id = crypto.randomBytes(4).toString('hex');
  const attachment = new AttachmentBuilder(video, {
    name: `saran_${id}.mp4`,
  });

  console.log(attachment);
  try {
    const embed = new EmbedBuilder()
      // .setAuthor({ name: firstImage.title, url: firstImage.url })
      .setTitle(stats.title)
      .setURL(url)
      .setFooter({
        iconURL:
          'https://www.freepnglogos.com/uploads/tik-tok-logo-png/tik-tok-april-tutuapp-5.png',
        text: `Likes: ${stats.likes} ∙ Comments: ${stats.comments} ∙ Shares: ${stats.shares} ∙ Requested by ${message.author.username}#${message.author.discriminator}`,
      })
      .setColor(CONSTANTS.COLORS.MIXER);
    await message.channel.send({ files: [attachment], embeds: [embed] });
    await message.delete();
  } catch (err) {
    return message.reply('File Too Large!');
  }

  console.log(videoUrl);
}

async function dlpanda(url) {
  const { data } = await axios.get(`https://dlpanda.com/?url=${url}`);

  const $ = cheerio.load(data);
  const div = $('video').children();
  const videoUrl = div.attr('src');

  const res = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  return { video: res.data, videoUrl };
}

async function fetchInfo(url) {
  const { data } = await axios.get(url);

  const $ = cheerio.load(data);
  const statDiv = $('.tiktok-ln2tr4-DivActionItemContainer');
  console.log(statDiv.children().length);

  const stats = {
    likes: '',
    comments: '',
    shares: '',
    title: $('title').text(),
  };

  $('strong').each((i, e) => {
    const type = e.attribs['data-e2e'];
    if (!type) return;

    if (type.includes('like')) {
      stats.likes = $(e).text();
    } else if (type.includes('comment')) {
      stats.comments = $(e).text();
    } else if (type.includes('share')) {
      stats.shares = $(e).text();
    }
  });

  return {
    likes: stats.likes ?? '0',
    comments: stats.comments ?? '0',
    shares: stats.shares ?? '0',
    title: stats.title,
  };
}
