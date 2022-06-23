import axios from 'axios';
const cheerio = require('cheerio');
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Util,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import Command2 from '../../utils/base/Command2';
import DiscordClient from '../../utils/client';
import { GetUserFromMessage } from '../../utils/Helpers/Moderation';

export default class StealEmote extends Command2 {
  constructor() {
    super('steal', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,steal <emote>`,
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
    for (const emojiText of args) {
      const emoji = Util.parseEmoji(emojiText);
      if (emoji.id) {
        const type = emoji.animated ? '.gif' : '.png';
        console.log(emoji.id);
        const url = `https://cdn.discordapp.com/emojis/${emoji.id + type}`;
        await message.guild.emojis.create(url, emoji.name);
        message.reply(`Created emoji :${emoji.name}:`);
      } else {
        message.reply('Invalid Emoji');
      }
    }
  }
}
