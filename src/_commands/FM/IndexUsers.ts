import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import Command2 from '../../utils/base/Command2';
import DiscordClient from '../../utils/client';
import { createGuildMember } from '../../utils/database/User';
import { getTopTenStats, SearchType } from '../../utils/fmHelpers';

export default class NowPlaying extends Command2 {
  constructor() {
    super('lf index', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const members = await message.guild.members.fetch();

    members.forEach(async (member) => {
      if (member.user.bot) return;
      await createGuildMember(member);
    });

    message.reply('Finished Indexing Server!');
  }
}
