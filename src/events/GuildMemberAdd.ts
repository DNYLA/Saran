import { GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { WebSearchImage } from '../utils/types';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    // const channels = member.guild.channels.fetch('');
    // membe
  }
}
