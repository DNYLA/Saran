import { ColorResolvable, Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { StringToColour } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { CommandOptions } from '../../utils/types';

export default class BoosterRoleCommand extends Command {
  constructor(subcommand: string, options?: CommandOptions) {
    super(
      'boosterrole',
      options ?? {
        aliases: ['br'],
        requirments: {
          permissions: {
            administrator: false,
          },
        },
        invalidPermissions: 'You must be admin to use this!',
        invalidUsage: `Do ,boosterrole <#hex>`,
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
      },
      subcommand
    );
  }

  async run(message: Message, args: unknown) {
    const argums = args as { colour: string };

    const guildUsersService = (message.client as DiscordClient).db.guildUsers;
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
    if (!guildUser.premiumSince) return message.reply('You gotta be booster!');

    const storedUser = await guildUsersService.findById(guild.id, user.id);
    const roleId = storedUser.customBoostRoleId;
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

    if (!argums.colour) return message.reply('Pass through a valid colour');

    try {
      // guildUser.roles.premiumSubscriberRole
      // console.log(guildUser.roles.premiumSubscriberRole);
      // await boosterRole.setIcon(args.iconLink);

      await boosterRole.setColor(argums.colour as ColorResolvable);
      if (storedUser.customBoostRoleId !== boosterRole.id)
        await guildUsersService.updateById(guild.id, user.id, {
          customBoostRoleId: boosterRole.id,
        });
      await guildUser.roles.add(boosterRole);

      // guild.roles.premiumSubscriberRole.setIcon(args.iconLink);
    } catch (err) {
      console.log(err);
      return message.reply('Invalid Colour Passed');
    }

    return message.reply('Succesfully set Icon');
  }
}
