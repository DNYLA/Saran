import { GuildMember } from 'discord.js';
import {
  fetchGuildUser,
  updateGuildUser,
} from '../services/database/guildUser';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberRemove');
  }

  async run(client: DiscordClient, member: GuildMember) {
    const user = await fetchGuildUser(member.guild.id, member.id, true);

    if (!user || !user) return; //No point of adding user to guild
    try {
      await updateGuildUser(member.guild.id, member.id, {
        inactive: true,
      });
    } catch (err) {
      console.log(err);
      //Log this somewhere

      //User Probably Doesnt exist in database
    }
  }
}
