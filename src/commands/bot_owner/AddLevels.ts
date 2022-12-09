import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import { prisma } from '../../services/prisma';
import Command from '../../utils/base/command';

export default class ArgsTest extends Command {
  constructor() {
    super('addlevels', {
      requirments: {
        userIDs: OwnerOnly,
      },
      hooks: {
        postCommand: () => console.log('Finished Executing'),
      },
    });
  }

  async run(message: Message) {
    const levels = await prisma.levels.findMany({
      where: { serverId: message.guildId },
    });

    const guild = await message.guild.fetch();
    await guild.roles.fetch();

    if (!levels) return message.reply('Done');

    const users = await prisma.guildUser.findMany({
      where: { serverId: message.guildId, level: { gt: 0 }, inactive: false },
    });

    await Promise.all(
      users.map(async (user, index) => {
        setTimeout(async () => {
          try {
            const validLevels = levels.filter((l) => user.level >= l.level);
            if (!validLevels || validLevels.length === 0) return;
            const local = await guild.members.fetch(user.userId);
            if (!local) return;

            for (let i = 0; i < validLevels.length; i++) {
              const level = validLevels[i];
              try {
                await local.roles.add(level.roleId);
              } catch (err) {
                console.log(err);
              }
            }
          } catch (err) {
            console.log(err);
          }
        }, index * 1000);
      })
    );

    message.reply('Done');
  }
}
