import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class ArgsTest extends Command {
  constructor() {
    super('dmowners', {
      aliases: ['messageowners'],
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
    let sentAmount = 0;
    let errorAmount = 0;
    console.log('Running DM owners');
    try {
      const guilds = await client.guilds.fetch();
      guilds.forEach(async (guild) => {
        const fetchedGuild = await guild.fetch();
        const ownerId = fetchedGuild.ownerId;
        const owner = await client.users.fetch(ownerId);
        try {
          await owner.send(args.content);
          // await owner.dmChannel.send(args.content);
        } catch (err) {
          errorAmount++;
          console.log(
            `Failed to DM to ${fetchedGuild.name} : ${fetchedGuild.id} : ${fetchedGuild.ownerId}.\nTotal Failed: ${errorAmount}`
          );
          console.log(err);
          return;
        }
        sentAmount++;
        console.log(
          `Sent DM to ${fetchedGuild.name} : ${fetchedGuild.id} : ${fetchedGuild.ownerId}.\nTotal Sent: ${sentAmount}`
        );
      });
    } catch (err) {
      console.log(err);
    }
  }
}
