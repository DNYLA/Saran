import { Message } from 'discord.js';
import StartTyping from '../../../hooks/StartTyping';
import { ChannelMentionIdOrArg } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import WelcomeCommand from '../../../utils/base/Welcome';
import DiscordClient from '../../../utils/client';
import SettingsCommand from '../Settings';

export default class WelcomeMessage extends SettingsCommand {
  constructor() {
    super('welcomeremove', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [],
    });
  }

  async run(message: Message) {
    const guildService = (message.client as DiscordClient).db.guilds;
    await guildService.updateById(message.guildId, {
      joinMessage: null,
      joinMessageChannel: null,
    });

    return await message.reply('Successfully removed welcome.');
  }
}
