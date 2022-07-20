import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import DiscordClient from '../../utils/client';
import {
  createGuildMember,
  fetchUserIdsWithUsername,
} from '../../utils/database/User';
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
    const db = (message.client as DiscordClient).db;
    const members = await message.guild.members.fetch();
    const userIds = await fetchUserIdsWithUsername();

    // const userIds = await db.users.repo.findMany({
    //   where: { lastFMName: { not: null } },
    //   select: { id: true },
    // });

    console.log(userIds);
    console.log(userIds.includes('827212859447705610'));
    const clientMembers = members.filter((user) => userIds.includes(user.id));
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
