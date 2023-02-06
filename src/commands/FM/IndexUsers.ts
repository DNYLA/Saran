import { GuildMember, Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import prisma from '../../services/prisma';
import LastFMCommand from './LastFM';

export default class IndexGuild extends LastFMCommand {
  constructor() {
    super('index', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      // deleteCommand: true,
    });
  }

  async run(message: Message) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const members = await message.guild.members.fetch();

    const users = await prisma.user.findMany({
      where: { lastFMName: { not: null } },
      select: { id: true },
    });

    const clientMembers = members.filter((user) =>
      users.includes({ id: user.id })
    );
    console.log(clientMembers.size);

    for (let i = 0; i < clientMembers.size; i++) {
      const member = clientMembers.at(i);
      if (member.user.bot) return;
      await createGuildMember(member);

      console.log(member.displayName);
    }

    console.log('Finished');
    message.reply('Finished Indexing Server!');
  }
}

async function createGuildMember(
  member: GuildMember,
  guildData?: any,
  updateOnlyData?: any
) {
  try {
    return await prisma.user.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
        guilds: {
          create: {
            displayName: member.displayName,
            serverId: member.guild.id,
            ...guildData,
          },
        },
      },
      update: {
        guilds: {
          upsert: {
            where: {
              userId_serverId: { userId: member.id, serverId: member.guild.id },
            },
            create: {
              displayName: member.displayName,
              serverId: member.guild.id,
              ...guildData,
            },
            update: { ...guildData, ...updateOnlyData },
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
    //Most likely user doesnt exist
  }
}
