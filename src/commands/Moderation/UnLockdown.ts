import { GuildChannel, Message } from 'discord.js';
import { OverwriteTypes } from 'discord.js/typings/enums';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

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
        await overwrite.edit({ SEND_MESSAGES: true });
      })
    );

    message.reply('The channel has been UNLOCKED DOWN!');
  }
}
