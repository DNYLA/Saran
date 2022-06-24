import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { getGuildUser } from '../../utils/database/User';

export default class Rank extends Command {
  constructor() {
    super('rank', {
      invalidUsage: `Do ,rank <UserMention>(Optional)`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getGuildUser(message.guildId, message.author.id);

    if (!user || user.guilds.length === 0)
      return message.reply('You have 0 XP');
    else return message.reply(`You have ${user.guilds[0].xp} xp`);
    // if (args.length === 0) return message.reply('Provide a URL to scrape!');
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
