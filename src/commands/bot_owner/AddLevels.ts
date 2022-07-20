import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
    const db = (message.client as DiscordClient).db;
    const levels = await db.levels.repo.findMany({
      where: { serverId: message.guildId },
    });

    const guild = await message.guild.fetch();
    await guild.roles.fetch();

    if (!levels) return message.reply('Done');

    const users = await db.guildUsers.repo.findMany({
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
