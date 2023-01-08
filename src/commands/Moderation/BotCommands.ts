import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class UnBan extends Command {
  constructor() {
    super('bc', {
      aliases: ['botcommands', 'botc'],
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,bc`,
    });
  }

  async run(message: Message) {
    const channel = message.channel;
    if (!channel.isTextBased()) return;
    if (channel.isDMBased()) return;

    const amount = 100;

    await message.delete();

    channel.messages.fetch({ limit: amount }).then((fetchedMessages) => {
      const messagesToPrune = fetchedMessages.filter((msg) => msg.author.bot);
      return channel.bulkDelete(messagesToPrune, true);
    });
  }
}
