import {
  ColorResolvable,
  APIEmbedField,
  EmbedBuilder,
  EmbedAuthorData,
  EmbedFooterData,
  Colors,
  resolveColor,
} from 'discord.js';
import { CONSTANTS } from './constants';

/*
  CREDIT: Credit for this embed builder goes to Bastion this is essentially
          a copy of their embed builder.
  LINK: https://github.com/TheBastionBot/Bastion/blob/f2d966f198f7839ae83954cf3475d530d97690fd/utils/embeds.ts

  Originally wasnt going to copy how they did it however extra data needs to be stripped (Video, Image Size etc)
*/

export interface EmbedBuilderData {
  author?: EmbedAuthorData;
  color?: number | string | ColorResolvable;
  fields?: APIEmbedField[];
  footer?: EmbedFooterData;
  description?: string;
  image?: string;
  thumbnail?: string;
  timestamp?: number | Date;
  title?: string;
  url?: string;
}

export const buildEmbed = (
  data: EmbedBuilderData | string,
  timestamp?: boolean
): EmbedBuilder => {
  let embed: EmbedBuilder;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.log(err);

      // this error can be ignored
    }
  }

  if (typeof data === 'string') {
    embed = new EmbedBuilder({
      description: data,
      color: CONSTANTS.COLORS.INFO,
    });

    if (timestamp) embed.setTimestamp();
    return embed;
  }

  if (!isValidEmbed(data)) {
    return new EmbedBuilder({
      description: 'Invalid embed data passed.',
      color: CONSTANTS.COLORS.ERROR,
    });
  }

  let colorNumber = NaN;
  if (typeof data.color === 'string') {
    const col = data.color.replace('#', '');
    colorNumber = parseInt(col, 16);
  } else if (typeof data.color === 'number') {
    colorNumber = data.color;
  }

  if (isNaN(colorNumber)) {
    return new EmbedBuilder({
      description: 'Invalid embed color passed.',
      color: CONSTANTS.COLORS.ERROR,
    });
  }

  try {
    embed = new EmbedBuilder({
      author: data.author,
      color: colorNumber || CONSTANTS.COLORS.INFO,
      description: data.description,
      fields: data.fields,
      footer: data.footer,
      image: {
        url: data.image,
      },
      thumbnail: {
        url: data.thumbnail,
      },
      timestamp: data.timestamp,
      title: data.title,
      url: data.url,
    });
  } catch (err) {
    console.log(err);
    return new EmbedBuilder({
      description: 'Invalid embed data passed.',
      color: CONSTANTS.COLORS.ERROR,
    });
  }

  if (timestamp) return embed.setTimestamp();

  return embed;
};

export const isValidEmbed = (embed: EmbedBuilderData | string): boolean => {
  if (typeof embed === 'string') {
    try {
      embed = JSON.parse(embed);
    } catch (err) {
      console.log(err);
      return false;
      // this error can be ignored
    }
  }

  if (typeof embed === 'string') return false;

  if (embed.author) {
    if (embed.author.name && typeof embed.author.name !== 'string')
      return false;
    if (embed.author.iconURL && typeof embed.author.iconURL !== 'string')
      return false;
    if (
      embed.author.proxyIconURL &&
      typeof embed.author.proxyIconURL !== 'string'
    )
      return false;
    if (embed.author.url && typeof embed.author.url !== 'string') return false;
  }

  //Check Colour
  if (embed.color) {
    if (typeof embed.color === 'string') {
      const reg = /^#([0-9a-f]{3}){1,2}$/i;
      if (!reg.test(embed.color)) return false;
    } else if (
      typeof embed.color !== 'number' &&
      !(embed.color instanceof Array)
    )
      return false;
  }
  if (embed.fields) {
    if (!(embed.fields instanceof Array)) return false;

    embed.fields.forEach((field) => {
      if (!field.name) return false;
      if (!field.value) return false;
      if (typeof field.name !== 'string') return false;
      if (typeof field.value !== 'string') return false;
      if (field.inline && typeof field.inline !== 'boolean') return false;
    });
  }

  if (embed.description && typeof embed.description !== 'string') return false;
  if (embed.image && typeof embed.image !== 'string') return false;
  if (embed.thumbnail && typeof embed.thumbnail !== 'string') return false;
  if (embed.url && typeof embed.url !== 'string') return false;
  if (embed.title && typeof embed.title !== 'string') return false;

  if (
    embed.timestamp &&
    typeof embed.timestamp !== 'string' &&
    !(embed.timestamp instanceof Date)
  )
    return false;

  //Check Footer
  if (embed.footer) {
    if (embed.footer.text && typeof embed.footer.text !== 'string')
      return false;
    if (embed.footer.iconURL && typeof embed.footer.iconURL !== 'string')
      return false;
    if (
      embed.footer.proxyIconURL &&
      typeof embed.footer.proxyIconURL !== 'string'
    )
      return false;
  }

  return true;
};
