import { Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { ImageUrlOrAttachment } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class BoosterRole extends Command {
  constructor() {
    super('boost', {
      requirments: {
        permissions: {
          administrator: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,boost <imageurl>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          name: 'iconLink',
          type: ArgumentTypes.FULL_SENTANCE,
          parse: ImageUrlOrAttachment,
        },
      ],
    });
  }

  async run(message: Message, args: { iconLink: string }) {
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

    if (!args.iconLink)
      return message.reply(
        'Currenty you can only pass through a image URL link as attachments do not work!'
      );

    try {
      // guildUser.roles.premiumSubscriberRole
      // console.log(guildUser.roles.premiumSubscriberRole);
      await boosterRole.setIcon(args.iconLink);
      if (storedUser.customBoostRoleId !== boosterRole.id)
        await guildUsersService.updateById(guild.id, user.id, {
          customBoostRoleId: boosterRole.id,
        });
      await guildUser.roles.add(boosterRole);

      // guild.roles.premiumSubscriberRole.setIcon(args.iconLink);
    } catch (err) {
      console.log(err);
      return message.reply('Unable to set that image as Icon');
    }

    return message.reply('Succesfully set Icon');
  }
}
