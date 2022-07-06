import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { SaranGuild } from '../../utils/database/Guild';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

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
    const storedGuild = await new SaranGuild(message.guildId).fetch();
    const guild = await message.guild.fetch();
    const channels = await guild.channels.fetch();

    if (storedGuild.config.jailChannel) {
      return message.reply(
        'Jail channel already setup please contact the developer if you wish to overwrite this!'
      );
    }

    const jailRole = await guild.roles.create({ name: 'Jailed' });
    const jailChannel = await guild.channels.create('jail');
    const jailLog = await guild.channels.create('jail-log');

    channels.map((chan) => {
      chan.permissionOverwrites.create(jailRole, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false,
      });
    });

    await jailChannel.permissionOverwrites.create(guild.roles.everyone, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    await jailChannel.permissionOverwrites.edit(jailRole, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
      CREATE_PUBLIC_THREADS: false,
      CREATE_PRIVATE_THREADS: false,
    });

    await jailLog.permissionOverwrites.create(guild.roles.everyone, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    await storedGuild.update({
      jailChannel: jailChannel.id,
      jailRole: jailRole.id,
      jailLogChannel: jailLog.id,
    });

    message.reply('Succesfully setup jail');
  }
}
