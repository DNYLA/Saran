import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { createGuildMember } from '../../utils/database/User';
import { getTopTenStats, SearchType } from '../../utils/fmHelpers';

export default class NowPlaying extends Command {
  constructor() {
    super('lf index', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    const id = message.guildId;
    const members = await message.guild.members.fetch();

    members.forEach(async (member) => {
      if (member.user.bot) return;
      await createGuildMember(member);
    });

    message.reply('Finished Indexing Server!');
  }
}
