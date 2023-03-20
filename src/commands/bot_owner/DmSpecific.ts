import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class ArgsTest extends Command {
  constructor() {
    super('testspam', {
      requirments: {
        userIDs: OwnerOnly,
      },
      arguments: [
        {
          name: 'content',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: { content: string }) {
    const client = message.client as DiscordClient;
    const guild = await client.guilds.fetch('924048930159874079');
    const channels = await guild.channels.fetch();
    console.log(channels);

    channels.forEach((channel) => {
      console.log(`${channel.name}:${channel.id}`);
    });

    const channel = await guild.channels.fetch('924139833281101834');
    const testGuild = await client.guilds.fetch('1086496896488591431');
    const testChannel = await testGuild.channels.fetch('1086496897121927232');
    if (!testChannel.isTextBased() || !channel.isTextBased()) {
      console.log('NOT TEXT CHANNEL');
      return;
    }

    testChannel.send(args.content);
    channel.send(args.content);
  }
}
