import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command from '../utils/base/command';
import DiscordClient from '../utils/client';

export default class Ping extends Command {
  constructor() {
    super('inviter', {
      aliases: ['ur'],
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: 'do ,ur <guildId>',
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const client = message.client as DiscordClient;
    const guild = await message.guild.fetch();
    const user = await guild.members.fetch(args[0]);

    const invites = await guild.invites.fetch();
    invites.map((invite) => {
      console.log(invite);
      // console.log(`${invite.user}`)
    });

    if (!user) return;
    const guildUser = await guild.members.fetch(message.author.id);

    if (!guildUser) return message.reply('Not in guild');
    message.reply('Done check logs');

    await guildUser.timeout(0);
  }
}
