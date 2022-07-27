import {
  Channel,
  Message,
  EmbedBuilder,
  NonThreadGuildBasedChannel,
} from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { ChannelMentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
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

  async run(message: Message, args: unknown) {
    return message.reply(
      'Visit https://www.saran.vercel.app/ on how to use this'
    );
  }
}
