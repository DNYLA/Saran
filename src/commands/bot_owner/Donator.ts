import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Donator extends Command {
  constructor() {
    super('donator', {
      requirments: {
        userIDs: OwnerOnly,
      },
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
    const usersService = (message.client as DiscordClient).database.users;

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

    if (type === 'add') {
      await usersService.updateById(userId, { donator: true });
      return message.reply(`Successfully given <@${userId}> donator`);
    } else if (type === 'remove') {
      await usersService.updateById(userId, { donator: false });
      return message.reply(`Removed donator from <@${userId}>`);
    }
  }
}
