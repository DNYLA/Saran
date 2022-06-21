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
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class GetAvatar extends Command {
  constructor() {
    super('steal', 'Tools', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    if (args.length === 0) return message.reply('Send an emote you!');
    // if (args.length === 0) return message.reply('Provide a URL to scrape!');
    for (const emojiText of args) {
      console.log(emojiText);
      const emoji = Util.parseEmoji(emojiText);

      if (emoji.id) {
        const type = emoji.animated ? '.gif' : '.png';
        console.log(emoji.id);
        const url = `https://cdn.discordapp.com/emojis/${emoji.id + type}`;
        await message.guild.emojis.create(url, emoji.name);
        message.reply('Created the emoji');
      }
    }
  }
}
