import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { updateUser } from '../../services/database/user';
import { ArgumentTypes } from '../../utils/base/command';
import LastFMCommand from './LastFM';

export default class SetTag extends LastFMCommand {
  constructor() {
    super('tag', {
      aliases: ['cc'],
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
          name: 'tag',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { tag: string }) {
    try {
      await updateUser(message.author.id, {
        lastFMTag: args.tag,
      });
      return message.reply(`Successfully set custom tag to ${args.tag}`);
    } catch (err) {
      return message.reply(
        'Error Occured whilst trying to set your custom tag.'
      );
    }
  }
}
