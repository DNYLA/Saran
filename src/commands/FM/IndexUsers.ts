import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import {
  createGuildMember,
  fetchUserIdsWithUsername,
} from '../../utils/database/User';

export default class IndexGuild extends Command {
  constructor() {
    super('lf index', {
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
    const members = await message.guild.members.fetch();
    const userIds = await fetchUserIdsWithUsername();

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

    // await clientMembers.forEach(async (member) => {
    //   if (member.user.bot) return;
    //   await createGuildMember(member);
    //   console.log(member.displayName);
    // });

    console.log('Finished');
    message.reply('Finished Indexing Server!');
  }
}
