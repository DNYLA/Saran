import { GuildMember } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberRemove');
  }

  async run(client: DiscordClient, member: GuildMember) {
    const user = await client.db.users.findGuildUser(
      member.id,
      member.guild.id
    );

    if (!user || !user.guilds) return; //No point of adding user to guild
    try {
      await client.db.guildUsers.updateById(member.guild.id, member.id, {
        inactive: true,
      });
    } catch (err) {
      console.log(err);
      //Log this somewhere

      //User Probably Doesnt exist in database
    }
  }
}
