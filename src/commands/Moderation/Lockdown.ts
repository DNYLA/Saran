import { GuildChannel, Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

export default class Mute extends Command {
  constructor() {
    super('lockdown', {
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

    await channel.permissionOverwrites.create(channel.guild.roles.everyone, {
      SEND_MESSAGES: false,
    });

    message.reply('The channel has been UN-LOCKED DOWN!');
  }
}
