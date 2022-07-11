import { GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { SaranGuildUser } from '../utils/database/Guild';
import { WebSearchImage } from '../utils/types';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberRemove');
  }

  async run(client: DiscordClient, member: GuildMember) {
    // const channels = member.guild.channels.fetch('');
    // membe

    console.log(member.user.username);
    try {
      const user = await new SaranGuildUser(member.id, member.guild.id).fetch();
      await user.update({ inactive: true });
    } catch (err) {
      console.log(err);
      //Log this somewhere
    }
  }
}
