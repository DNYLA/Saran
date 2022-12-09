import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { fetchGuild, updateGuild } from '../../services/database/guild';
import Command from '../../utils/base/command';

export default class JailSetup extends Command {
  constructor() {
    super('jailsetup', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,kick <UserMention> <Reason>(Optional)`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    const config = await fetchGuild(message.guildId);
    const guild = await message.guild.fetch();
    const channels = await guild.channels.fetch();

    if (config.jailChannel) {
      return message.reply(
        'Jail channel already setup please contact the developer if you wish to overwrite this!'
      );
    }

    const jailRole = await guild.roles.create({ name: 'Jailed' });
    const jailChannel = await guild.channels.create({ name: 'jail' });
    const jailLog = await guild.channels.create({ name: 'jail-log' });

    channels.map((chan) => {
      chan.permissionOverwrites.create(jailRole, {
        ViewChannel: false,
        SendMessages: false,
      });
    });

    await jailChannel.permissionOverwrites.create(guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: false,
    });

    await jailChannel.permissionOverwrites.edit(jailRole, {
      ViewChannel: true,
      SendMessages: true,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
    });

    await jailLog.permissionOverwrites.create(guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: false,
    });

    await updateGuild(message.guildId, {
      jailChannel: jailChannel.id,
      jailRole: jailRole.id,
      jailLogChannel: jailLog.id,
    });

    message.reply('Succesfully setup jail');
  }
}
