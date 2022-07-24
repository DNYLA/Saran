import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { CONSTANTS } from '../../utils/constants';
import { isValidEmbed } from '../../utils/embedbuilder';
import LastFMCommand from './LastFM';

export default class SetUsername extends LastFMCommand {
  constructor() {
    super('mode', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: `Usage: ,lf mode <Normal | Donator | EmbedData>`,
      arguments: [
        {
          name: 'mode',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: { mode: string }) {
    const userService = (message.client as DiscordClient).db.users;
    const user = await userService.findById(message.author.id);
    const mode = args.mode.toLowerCase();
    if (!user.donator)
      return message.channel.send({
        embeds: [
          {
            color: CONSTANTS.COLORS.ERROR,
            description: `<@${user.id}>: **You must be a donator to use this command.**`,
          },
        ],
      });

    if (mode !== 'donator' && mode !== 'normal' && !isValidEmbed(args.mode)) {
      return message.channel.send({
        embeds: [
          {
            color: CONSTANTS.COLORS.ERROR,
            description: `<@${user.id}>: **Invalid embed data passed. Go to https://saran.vercel.app/embeds to generate an embed.**`,
          },
        ],
      });
    }

    await userService.updateById(user.id, { lastFMMode: args.mode });

    return message.channel.send({
      embeds: [
        {
          color: CONSTANTS.COLORS.SUCCESS,
          description: `✅ <@${user.id}>: **Successfully changed mode. Use ,lf mode <donator | normal> to reset it back to normal.**`,
        },
      ],
    });
  }
}
