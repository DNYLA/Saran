import { GuildMember } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await client.database.guildUsers.findById(
      member.guild.id,
      member.id
    ); //Fetching now will use it later for checking muted or jailed

    try {
      await client.database.guildUsers.updateById(member.guild.id, member.id, {
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
