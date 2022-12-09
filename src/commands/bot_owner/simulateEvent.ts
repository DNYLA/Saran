import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import { prisma } from '../../services/prisma';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class UnmuteRemote extends Command {
  constructor() {
    super('simulateevent', {
      aliases: ['se'],
      requirments: {
        userIDs: OwnerOnly,
      },
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: [
        {
          name: 'type',
          type: ArgumentTypes.SINGLE,
        },
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'mentionOrSelfId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { type: string; mentionOrSelfId: string }) {
    const client = message.client as DiscordClient;
    const guild = await client.guilds.fetch(message.guildId);
    const member = await guild.members.fetch(args.mentionOrSelfId);

    if (!member) return;

    if (args.type === 'add') {
      client.emit('guildMemberAdd', member);
    } else if (args.type === 'remove') {
      client.emit('guildMemberRemove', message.member);
    } else if (args.type === 'clearTracks') {
      await prisma.userTracks.deleteMany({});
      await prisma.userArtists.deleteMany({});
      await prisma.userAlbums.deleteMany({});
    }
  }
}
