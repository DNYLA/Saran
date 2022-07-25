import { GuildMember } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    const db = client.db;
    const user = await db.users.findGuildUser(member.id, member.guild.id);

    if (user.guilds.length === 0) {
      await db.guildUsers.create(member.id, member.guild.id);
      return;
    }

    try {
      await client.db.guildUsers.updateById(member.guild.id, member.id, {
        inactive: false,
      });
    } catch (err) {
      console.log(err);
      //Log this somewhere

      //User Probably Doesnt exist in database
    }

    //WasMuted?

    //WasJailed?
  }
}
