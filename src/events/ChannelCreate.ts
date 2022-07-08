import {
  GuildChannel,
  GuildMember,
  Interaction,
  Message,
  MessageEmbed,
} from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { SaranGuild } from '../utils/database/Guild';
import { WebSearchImage } from '../utils/types';

export default class InteractionCreated extends Event {
  constructor() {
    super('channelCreate');
  }

  async run(client: DiscordClient, channel: GuildChannel) {
    const storedGuild = await new SaranGuild(channel.guildId).fetch();

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

    // const channels = member.guild.channels.fetch('');
    // membe
  }
}
