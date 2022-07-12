import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { SearchQueryArgs } from './ImageSearch';

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
      invalidUsage: 'Do ,ud <word>',
      arguments: [
        {
          name: 'query',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: SearchQueryArgs) {
    const author = message.member;
    const { query: term } = args;
    const { data } = await axios.get(
      `https://api.urbandictionary.com/v0/define?term=${term}`
    );

    const responses: UrbanDictionaryLookup[] = data.list;

    if (responses.length === 0)
      return message.reply(`No lookup found for term ${term}`);

    const res = responses[0];
    const embed = new MessageEmbed()
      .setColor('#008efb')
      .setAuthor({
        name: author.displayName,
        iconURL: author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(term)
      .setURL(res.permalink)
      .setDescription(res.definition)
      .addField('Example', res.example)
      .addField('Votes', `👍 ${res.thumbs_up} / ${res.thumbs_down} 👎`);

    return message.channel.send({ embeds: [embed] });
  }
}
