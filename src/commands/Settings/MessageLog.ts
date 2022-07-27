import { Message, NonThreadGuildBasedChannel } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { ChannelMentionIdOrArg } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import SettingsCommand from './Settings';

export default class MessageLog extends SettingsCommand {
  constructor() {
    super('messagelog', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,settings messagelog <#Channel | ID>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          optional: true,
          default(message) {
            return message.channelId;
          },
          parse: ChannelMentionIdOrArg,
          name: 'channelId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { channelId?: string }) {
    const db = (message.client as DiscordClient).db;
    let channel: NonThreadGuildBasedChannel;
    try {
      channel = await message.guild.channels.fetch(args.channelId);
    } catch (err) {
      console.log(err);
    }

    if (!channel) return message.reply('Channel doesnt exist');
    if (channel.isVoiceBased() || channel.isThread())
      return message.reply('Not a text channel!');

    await db.guilds.updateById(message.guildId, { messageLog: channel.id });

    return message.reply(`Successfully set <#${channel.id}> as message log!`);
  }
}
