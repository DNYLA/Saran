import axios from 'axios';
const cheerio = require('cheerio');
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { fetchQueryImages } from '../../api/WebSearch';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class GetAvatar extends Command {
  constructor() {
    super('sanar', 'Tools', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    // if (args.length === 0) return message.reply('Provide a URL to scrape!');
    message.channel.send('Disabled');
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
