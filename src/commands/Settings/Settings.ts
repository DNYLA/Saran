import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { CommandOptions } from '../../utils/types';

export default class SettingsCommand extends Command {
  constructor(subcommand: string, options?: CommandOptions) {
    super(
      'settings',
      options ?? {
        requirments: {
          permissions: {
            administrator: true,
          },
        },
        isSubcommand: true,
        invalidPermissions: 'You must be admin to use this!',
        hooks: {
          preCommand: StartTyping,
        },
      },
      subcommand
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //Child classes inherit and need this args{} to be set
  async run(message: Message, args: { channelId?: string }) {
    return await message.reply(
      'Visit https://www.saran.vercel.app/ on how to use this'
    );
  }
}
