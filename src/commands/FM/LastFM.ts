import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { CommandOptions } from '../../utils/types';

export default class LastFMCommand extends Command {
  constructor(subcommand: string, options?: CommandOptions) {
    super(
      'lastfm',
      options ?? {
        requirments: {
          custom: UsernameCheck,
        },
        aliases: ['lf'],
        isSubcommand: true,
        hooks: {
          preCommand: StartTyping,
          postCheck: NoUsernameSet,
        },
        arguments: [
          {
            parse: MentionUserId,
            default: SelfUserId,
            name: 'targetUserId',
            type: ArgumentTypes.SINGLE,
          },
        ],
      },
      subcommand
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(message: Message, args: unknown): Promise<Message | void> {
    return message.reply(
      'To view a list of last.fm commands go to https://saran.vercel.app'
    );
  }
}
