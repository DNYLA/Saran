import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class Sanar extends Command {
  constructor() {
    super('saran', {
      invalidUsage: `Do ,av <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
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
