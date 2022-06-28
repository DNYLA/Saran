import axios from 'axios';
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
import ytSearch from 'youtube-search';
import { SearchQueryArgs } from './ImageSearch';
const opts = {
  maxResults: 1,
  key: process.env.GOOGLE_API_KEY,
  type: 'video',
};

export type UrbanDictionaryLookup = {
  definition: string;
  permalink: string;
  thumbs_up: number;
  thumbs_down: number;
  current_vote?: string;
  author: string;
  word: string;
  written_on: string;
  example: string;
};

export default class YoutubeSearch extends Command {
  constructor() {
    super('yt', {
      aliases: ['Youtube'],
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Do ,yt <word>',
      args: [
        {
          name: 'query',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: string[], argums: SearchQueryArgs) {
    const { query: term } = argums;

    const results = await ytSearch(term, opts).catch(console.error);
    // return message.channel.send(results);
    if (!results) return message.reply('No video found!');
    if (results.results.length === 0)
      return message.reply(`No results matching ${term}`);

    const video = results.results[0];

    return message.channel.send(video.link);
  }
}
