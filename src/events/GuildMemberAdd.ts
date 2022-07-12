import { GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { SaranGuildUser } from '../utils/database/Guild';
import { WebSearchImage } from '../utils/types';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    const user = await new SaranGuildUser(member.id, member.guild.id).fetch();
    if (!user) return;

    //if user has already been apart of the guild.
    if (user.self.inactive) {
      await user.update({ inactive: false });
    }

    //WasMuted?

    //WasJailed?
  }
}
