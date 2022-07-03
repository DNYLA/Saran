import { ColorResolvable, Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import {
  ImageUrlOrAttachment,
  MentionIdOrArg,
  MentionUserId,
  StringToColour,
} from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { SaranGuildUser } from '../../utils/database/Guild';
import { getDiscordUserFromMention } from '../../utils/Helpers/Moderation';

export default class BoosterRoleColour extends Command {
  constructor() {
    super('boostcol', {
      requirments: {
        permissions: {
          administrator: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,boostcol <#hex>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          name: 'colour',
          type: ArgumentTypes.SINGLE,
          parse: StringToColour,
        },
      ],
    });
  }

  async run(message: Message, args: { colour: string }) {
    console.log('running');
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

    const storedUser = await new SaranGuildUser(user.id, guild.id).fetch();

    let roleId = storedUser.self.customBoostRoleId;
    let boosterRole: Role;

    if (!roleId) {
      boosterRole = await guild.roles.create({
        name: guildUser.displayName,
        color: 'AQUA',
      });
    } else {
      try {
        boosterRole = await guild.roles.fetch(roleId);
        if (!boosterRole) {
          boosterRole = await guild.roles.create({
            name: guildUser.displayName,
            color: 'AQUA',
          });
        }
      } catch (err) {
        boosterRole = await guild.roles.create({
          name: guildUser.displayName,
          color: 'AQUA',
        });
      }
    }

    if (!args.colour) return message.reply('Pass through a valid colour');

    try {
      // guildUser.roles.premiumSubscriberRole
      // console.log(guildUser.roles.premiumSubscriberRole);
      // await boosterRole.setIcon(args.iconLink);

      await boosterRole.setColor(args.colour as ColorResolvable);
      if (storedUser.self.customBoostRoleId !== boosterRole.id)
        await storedUser.update({ customBoostRoleId: boosterRole.id });
      await guildUser.roles.add(boosterRole);

      // guild.roles.premiumSubscriberRole.setIcon(args.iconLink);
    } catch (err) {
      console.log(err);
      return message.reply('Invalid Colour Passed');
    }

    return message.reply('Succesfully set Icon');
  }
}