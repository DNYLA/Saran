import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg, MentionUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getDiscordUserFromMention } from '../../utils/Helpers/Moderation';

export default class Ban extends Command {
  constructor() {
    super('ban', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,ban <UserMention> <Reason>(Optional)`,
      hooks: {
        preCommand: StartTyping,
      },
      args: [
        {
          parse: MentionIdOrArg,
          name: 'mentionedUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'reason',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: string[],
    argums: { mentionedUserId: string; reason: string }
  ) {
    console.log(argums);
    const user = await message.client.users.fetch(argums.mentionedUserId);
    if (!user) return message.reply('User doesnt exist!');

    if (user.id === '827212859447705610') {
      message.reply(
        `I stayed awake and got rich
      I'm ready to die like this
      You fell asleep you missed it
      I hope your time ain't missed
      Life is a game this a glitch
      And I couldn't simulate this
      I'm gonna get what I want, and that's it, yeah
      I'm ready to die like this, yeah
      I'm ready to die like this
      Yeah-yeah, yeah-yeah
      I'm ready to die like this
      I'm ready to die like this, yeah
      Yeah-yeah, yeah-yeah
      I'm ready to die like this
      I'm ready to die like this`
      );
      return message.reply('Cant ban this guy because he is too powerfull!');
    }

    try {
      const prevBan = await message.guild.bans.fetch({ user: user.id });
      if (prevBan)
        return message.reply(
          `${user.username}#${user.discriminator} already banned for ${prevBan.reason}`
        );
    } catch (err) {}

    try {
      await message.guild.bans.create(user.id, { reason: argums.reason ?? '' });
      let embedMessage = `Successfully banned ${user.username}#${user.discriminator}`;
      if (argums.reason) {
        embedMessage += ` for ${argums.reason}`;
      }
      message.reply(embedMessage);
    } catch (err) {
      message.reply('Unable to ban user!');
    }
  }
}
