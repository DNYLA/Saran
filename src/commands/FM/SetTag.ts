import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
          name: 'tag',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { tag: string }) {
    const userService = (message.client as DiscordClient).database.users;
    try {
      await userService.updateById(message.author.id, {
        lastFMTag: args.tag,
      });
      message.reply(`Successfully set custom tag to ${args.tag}`);
    } catch (err) {
      message.reply('Error Occured whilst trying to set your custom tag.');
    }
  }
}
