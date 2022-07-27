import { Message } from 'discord.js';
import StartTyping from '../../../hooks/StartTyping';
import { ChannelMentionIdOrArg } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import WelcomeCommand from '../../../utils/base/Welcome';
import DiscordClient from '../../../utils/client';
import SettingsCommand from '../Settings';

export default class WelcomeMessage extends SettingsCommand {
  constructor() {
    super('welcomeadd', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,settings welcomeadd <channel> <message>\nExample: ,settings welcomeadd #general Welcome {mention}.`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: ChannelMentionIdOrArg,
          name: 'channelId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'message',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: { channelId: string; message: string }) {
    const channel = await message.guild.channels.fetch(args.channelId);
    if (!channel || !channel.isTextBased())
      return message.reply("Text channel doesn't exist.");

    const guildService = (message.client as DiscordClient).db.guilds;
    await guildService.updateById(message.guildId, {
      joinMessageChannel: args.channelId,
      joinMessage: args.message,
    });

    await message.reply('Successfully added welcome message.');

    const re = new RegExp('{mention}', 'g');
    const parsed = args.message.replace(re, `<@${message.member.id}>`);
    channel.send({ content: parsed });
  }
}
