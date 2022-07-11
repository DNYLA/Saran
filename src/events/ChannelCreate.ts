import { GuildChannel } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('channelCreate');
  }

  async run(client: DiscordClient, channel: GuildChannel) {
    const storedGuild = await client.database.guild(channel.guildId);
    if (!storedGuild.config.jailRole) return;

    const role = await channel.guild.roles
      .fetch(storedGuild.config.jailRole)
      .catch(console.error);

    if (!role) {
      await storedGuild.update({
        jailRole: null,
        jailChannel: null,
        jailLogChannel: null,
      });
      return;
    }

    channel.permissionOverwrites.edit(role, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });
  }
}
