import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Jail extends Command {
  constructor() {
    super('jail', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,jail <UserMention> <Time>(Optional Doesnt work right now)`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
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
    args: { mentionedUserId: string; time: string; reason: string }
  ) {
    const db = (message.client as DiscordClient).db;
    const config = await db.guilds.findById(message.guildId);
    if (!config.jailChannel)
      return message.reply('Use ,jailsetup to setup the jail');

    const guild = await message.guild.fetch();
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');

    const roleIds = [];

    await Promise.all(
      user.roles.cache.map(async (role) => {
        console.log(role);

        if (role.id === guild.roles.everyone.id) return;
        roleIds.push(role.id);
        await user.roles.remove(role.id);
      })
    );
    // for (let i = 0; i < roles.size; i++) {
    //   const role: Role = roles[i];
    //   console.log(role);

    //   if (role.id === guild.roles.everyone.id) continue;
    //   roleIds.push(role.id);
    //   await user.roles.remove(role.id);
    // }

    await db.guildUsers.updateById(message.guildId, args.mentionedUserId, {
      preJailedRoles: roleIds,
    });

    const embed = new EmbedBuilder({
      title: `${user.displayName} Jailed`,
      color: 16736088,
      fields: [
        {
          name: 'Jailer',
          value: `<@${message.author.id}>`,
          inline: true,
        },
        {
          name: 'Time',
          value: 'Indefinate',
          inline: true,
        },
        {
          name: 'Reason',
          value: args.reason ?? 'N/A',
        },
      ],
      author: {
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      },
    }).setTimestamp();

    await user.send({ embeds: [embed] });

    try {
      const logChannel = await guild.channels
        .fetch(config.jailLogChannel)
        .catch(() => console.log('No Jail Log channel'));

      if (logChannel && logChannel.isTextBased())
        logChannel.send({ embeds: [embed] });
      // if (logChannel);
    } catch (err) {
      console.log(err);
    }

    try {
      await user.roles.add(config.jailRole);
    } catch (err) {
      return message.reply('Jail Role Doesnt exist');
    }

    return message.reply('Succesfully Jailed User!');
  }
}
