import { GuildChannel, Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class Mute extends Command {
  constructor() {
    super('unlockdown', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    const channel = (await message.channel.fetch()) as GuildChannel;

    await Promise.all(
      channel.permissionOverwrites.cache.map(async (overwrite) => {
        await overwrite.edit({ SendMessages: true });
      })
    );

    message.reply('The channel has been UNLOCKED DOWN!');
  }
}
