import {
  GuildBasedChannel,
  Message,
  NonThreadGuildBasedChannel,
} from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { updateGuild } from '../../services/database/guild';
import { ChannelMentionIdOrArg } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import SettingsCommand from './Settings';

export default class AfkChannel extends SettingsCommand {
  constructor() {
    super('afklog', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,settings afklog <#Channel | ID>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          optional: true,
          parse: ChannelMentionIdOrArg,
          name: 'channelId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { channelId?: string }) {
    let channel: GuildBasedChannel;
    try {
      channel = await message.guild.channels.fetch(args.channelId);
    } catch (err) {
      console.log(err);
    }

    if (!channel) return message.reply('Channel doesnt exist');
    if (channel.isVoiceBased() || channel.isThread())
      return message.reply('Not a text channel!');

    await updateGuild(message.guildId, { messageLog: channel.id });

    await message.reply(`Successfully set <#${channel.id}> as message log!`);
  }
}
