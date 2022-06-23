import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetAvatar extends Command {
  constructor() {
    super('avatar', {
      aliases: ['av'],
      invalidUsage: `Do ,av <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    try {
      message.channel.send({
        embeds: [await getAvatarEmbed(AvatarType.Profile, message)],
      });
    } catch (err) {
      message.channel.send('Unable to process request');
    }
  }
}
