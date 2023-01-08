import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class UnBan extends Command {
  constructor() {
    super('prune', {
      aliases: ['purge', 'clear'],
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,prune <amount> (default: 5)`,
      arguments: [
        {
          name: 'amount',
          optional: true,
          type: ArgumentTypes.INTEGER,
        },
      ],
    });
  }

  async run(message: Message, args: { amount: number }) {
    if (!args.amount) args.amount = 5;
    if (args.amount <= 0) return;
    if (args.amount > 100) args.amount = 100;
    const channel = message.channel;
    if (!channel.isTextBased()) return;
    if (channel.isDMBased()) return;

    channel.messages.fetch({ limit: args.amount }).then((fetchedMessages) => {
      const messagesToPrune = fetchedMessages.filter((msg) => !msg.pinned);

      return channel.bulkDelete(messagesToPrune, true);
    });
  }
}
