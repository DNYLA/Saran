import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Jail extends Command {
  constructor() {
    super('unjail', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,unjail <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionIdOrArg,
          name: 'mentionedUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { mentionedUserId: string }) {
    const db = (message.client as DiscordClient).database;
    const config = await db.guilds.findById(message.guildId);
    if (!config.jailRole)
      return message.reply('Use ,jailsetup to setup the jail');

    const guild = await message.guild.fetch();
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');

    const guildMember = await db.guildUsers.findById(
      args.mentionedUserId,
      message.guildId
    );

    if (!user.roles.cache.has(config.jailRole)) {
      return message.reply('user is not jailed');
    }

    const roleIds = guildMember.preJailedRoles;

    await user.roles.remove(config.jailRole).catch(console.error);

    for (let i = 0; i < roleIds.length; i++) {
      const id = roleIds[i];
      try {
        await user.roles.add(id);
      } catch (err) {
        console.log(err);
      } //Role might not exist anymores
    }

    await db.guildUsers.updateById(message.guildId, guildMember.userId, {
      displayName: user.displayName,
      preJailedRoles: [],
    });

    const embed = new MessageEmbed({
      title: `${user.displayName} Un-Jailed`,
      color: 3993982,
      fields: [
        {
          name: 'Moderator',
          value: `<@${message.author.id}>`,
          inline: true,
        },
      ],
      author: {
        name: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      },
    }).setTimestamp();

    await user.send({ embeds: [embed] });

    try {
      const logChannel = await guild.channels
        .fetch(config.jailLogChannel)
        .catch(() => console.log('No Jail Log channel'));

      if (logChannel && logChannel.isText())
        logChannel.send({ embeds: [embed] });
      // if (logChannel);
    } catch (err) {
      console.log(err);
    }

    return message.reply('Succesfully Unjailed User!');
  }
}
