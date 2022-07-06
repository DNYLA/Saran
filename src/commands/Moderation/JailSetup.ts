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

    guild.roles.create({ name: 'Jailed' });
  }
}
