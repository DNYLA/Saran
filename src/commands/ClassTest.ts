import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command from '../utils/base/command';
import { SaranGuild } from '../utils/database/Guild';
import { SaranUser } from '../utils/database/User';

export default class Ping extends Command {
  constructor() {
    super('ct', {
      aliases: ['classtest'],
      requirments: {
        custom: UsernameCheck,
        userIDs: ['827212859447705610'],
        permissions: {
          administrator: false,
          manageMessage: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
        postCommand: () => console.log('Finished Executing'),
      },
    });
  }

  async run(message: Message) {
    const user = await new SaranUser('863092043249483796').fetch();
    const guild = await new SaranGuild('987380648362774608').fetch();
    await guild.fetch(true);
    const topTen = await guild.fetchQueryUsers({
      take: 10,
      orderBy: { xp: 'desc' },
    });

    console.log(topTen);
    return message.reply('Pong');
  }
}
