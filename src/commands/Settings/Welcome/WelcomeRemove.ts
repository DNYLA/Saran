import { Message } from 'discord.js';
import StartTyping from '../../../hooks/StartTyping';
import { updateGuild } from '../../../services/database/guild';
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
    await updateGuild(message.guildId, {
      joinMessage: null,
      joinMessageChannel: null,
    });

    return await message.reply('Successfully removed welcome.');
  }
}
