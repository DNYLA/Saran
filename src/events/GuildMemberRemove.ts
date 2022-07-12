import { GuildMember } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberRemove');
  }

  async run(client: DiscordClient, member: GuildMember) {
    // const channels = member.guild.channels.fetch('');
    // membe

    try {
      await client.database.guildUsers.updateById(member.guild.id, member.id, {
        inactive: true,
      });
    } catch (err) {
      console.log(err);
      //Log this somewhere

      //User Probably Doesnt exist in database
    }
  }
}
