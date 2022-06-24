import axios from 'axios';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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

export default class ImageSearch extends Command {
  constructor() {
    super('urbandctionary', {
      aliases: ['ud'],
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const client = message.client as DiscordClient;

    const author = message.member;
    const term = args.join(' ');
    const { data } = await axios.get(
      `https://api.urbandictionary.com/v0/define?term=${term}`
    );

    const responses: UrbanDictionaryLookup[] = data.list;

    if (responses.length === 0)
      return message.reply(`No lookup found for term ${term}`);

    const query = responses[0];
    const embed = new MessageEmbed()
      .setColor('#008efb')
      .setAuthor({
        name: author.displayName,
        iconURL: author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(term)
      .setURL(query.permalink)
      .setDescription(query.definition)
      .addField('Example', query.example)
      .addField('Votes', `👍 ${query.thumbs_up} : ${query.thumbs_down} 👎`);

    return message.channel.send({ embeds: [embed] });
  }
}
