import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg, MentionUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getDiscordUserFromMention } from '../../utils/Helpers/Moderation';

export default class Ban extends Command {
  constructor() {
    super('boost', {
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
      arguments: [
        { name: 'iconLink', type: ArgumentTypes.FULL_SENTANCE, optional: true },
      ],
    });
  }

  async run(message: Message, args: { iconLink: string }) {
    const user = await message.client.users.fetch(message.author.id);
    if (!user) return message.reply('User doesnt exist!');

    const guild = await message.guild.fetch();
    const guildUser = await message.member.fetch();
    console.log(guildUser.premiumSince);

    if (guild.premiumTier === 'TIER_1' || guild.premiumTier === 'NONE') {
      return message.reply(
        'This guild is not level 2 so this feature cannot be accessed!'
      );
    }

    // if (!guildUser.premiumSince) return message.reply('You gotta be booster!');

    if (!args.iconLink)
      return message.reply(
        'Currenty you can only pass through a image URL link as attachments do not work!'
      );

    try {
      // guildUser.roles.premiumSubscriberRole
      // console.log(guildUser.roles.premiumSubscriberRole);
      guild.roles.premiumSubscriberRole.setIcon(args.iconLink);
    } catch (err) {
      console.log(err);
      return message.reply('Unable to set that image as Icon');
    }

    return message.reply('Succesfully set Icon');
  }
}
