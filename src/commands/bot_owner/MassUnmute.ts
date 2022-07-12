import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class UnmuteRemote extends Command {
  constructor() {
    super('unmuteRemote', {
      aliases: ['ur'],
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: 'do ,ur <guildId>',
      requirments: {
        userIDs: OwnerOnly,
      },
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: [
        {
          name: 'guildId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { guildId: string }) {
    const client = message.client as DiscordClient;
    const guild = await client.guilds.fetch(args.guildId).catch(console.error);
    if (!guild)
      return message.reply('Invalid Guild | Saran is not inside guild!');

    const guildUser = await guild.members.fetch(message.author.id);

    if (!guildUser) return message.reply('Not in guild');
    await guildUser.timeout(0);

    message.reply('Succesfully unmuted!');
  }
}
