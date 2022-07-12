import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command from '../utils/base/command';

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
    // const guild = await new SaranGuild('987380648362774608').fetch();
    // const client = message.client as DiscordClient;
    // const newUser = await client.db.user('863092043249483796');

    return message.reply('Pong');
  }
}
