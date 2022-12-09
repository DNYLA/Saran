import { GuildChannel } from 'discord.js';
import { fetchGuild, updateGuild } from '../services/database/guild';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('channelCreate');
  }

  async run(client: DiscordClient, channel: GuildChannel) {
    const guild = await fetchGuild(channel.guildId);
    if (!guild.jailRole) return;

    const role = await channel.guild.roles
      .fetch(guild.jailRole)
      .catch(console.error);

    if (!role) {
      await updateGuild(channel.guildId, {
        jailRole: null,
        jailChannel: null,
        jailLogChannel: null,
      });
      return;
    }

    channel.permissionOverwrites.edit(role, {
      ViewChannel: false,
      SendMessages: false,
    });
  }
}
