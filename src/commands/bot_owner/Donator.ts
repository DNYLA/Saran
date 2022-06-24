import { Client, Collection, Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { createGuildMember, updateUserById } from '../../utils/database/User';
import { getUserFromMention } from '../../utils/helpers';

export default class Donator extends Command {
  constructor() {
    super('donator', {
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'Only bot owner can access this command!',
      invalidUsage: ',donater <add | remove> <userid | guildid>',
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 2,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const guild = await message.guild.fetch();
    const type = args[0];
    const user = await getUserFromMention(args[1]);
    if (!user && type === 'guild') {
      try {
        const guild = await message.client.guilds.fetch(args[1]);
        if (!guild) return;

        const members = await guild.members.fetch();
        await Promise.all(
          members.map(async (member) => {
            await updateUserById(member.id, { donator: true });
          })
        );
        return message.reply('Given everyone in guild donator!');
      } catch (err) {}
    }

    if (!user) return message.reply('User doesnt exist!');
    if (type === 'add') {
      await updateUserById(user.id, { donator: true });
      return message.reply(`Successfully given <@${user.id}> donator`);
    } else if (type === 'remove') {
      await updateUserById(user.id, { donator: false });
      return message.reply(`Removed donator from <@${user.id}>`);
    }
  }
}
