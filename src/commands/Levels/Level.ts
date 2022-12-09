import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { fetchGuildUser } from '../../services/database/guildUser';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class UserLevel extends Command {
  constructor() {
    super('level', {
      aliases: ['rank'],
      invalidUsage: `Do ,level <UserMention>(Optional)`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string }) {
    const guildUser = await message.guild.members.fetch(args.targetUserId);
    const user = await fetchGuildUser(message.guildId, args.targetUserId);
    const isSelf = args.targetUserId === message.author.id;
    const targetText = isSelf ? 'You are' : guildUser.displayName + ' is';
    const xpThreshhold = Math.floor(
      500 * user.level * Math.floor((user.level + 1) * 0.5)
    );

    return message.reply(
      `${targetText} Level: ${user.level} - XP: ${user.xp}/${xpThreshhold}`
    );
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
