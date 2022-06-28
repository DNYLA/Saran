import { Client, Collection, Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import {
  createGuildMember,
  getUser,
  updateUserById,
} from '../../utils/database/User';
import { getUserFromMention } from '../../utils/helpers';

export default class Donator extends Command {
  constructor() {
    super('donator', {
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'Only bot owner can access this command!',
      invalidUsage: ',donater <add | remove> <userid>',
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          name: 'type',
          type: ArgumentTypes.SINGLE,
        },
        {
          parse: MentionIdOrArg,
          name: 'userId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { type: string; userId: string }) {
    const { type, userId } = args;

    const user = await getUser(userId);
    // if (!user && type === 'guild') {
    //   try {
    //     const guild = await message.client.guilds
    //       .fetch(args.userId)
    //       .catch(console.error);
    //     if (!guild) return message.reply('Invalid Guild ID');

    //     const members = await guild.members.fetch();

    //     await Promise.all(
    //       //Switch to Prisma.Table.UpdateMany()
    //       members.map(async (member) => {
    //         await updateUserById(member.id, { donator: true });
    //       })
    //     );
    //     return message.reply('Given everyone in guild donator!');
    //   } catch (err) {}
    // }

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
