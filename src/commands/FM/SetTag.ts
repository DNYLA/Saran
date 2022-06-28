import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { updateUserById } from '../../utils/database/User';

export default class SetTag extends Command {
  constructor() {
    super('lf tag', {
      aliases: ['lftag'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf tag <custom_tag>',
      arguments: [
        {
          name: 'newTag',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { newTag: string }) {
    if (updateUserById(message.author.id, { lastFMTag: args.newTag })) {
      message.reply(`Successfully set custom tag to ${args.newTag}`);
    } else {
      message.reply('Error Occured whilst trying to set your custom tag.');
    }
  }
}
