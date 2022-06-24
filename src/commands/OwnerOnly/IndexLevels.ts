import { Collection, Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class IndexLevels extends Command {
  constructor() {
    super('indexlevels', {
      aliases: ['levelsIndex'],
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'Only bot owner can access this command!',
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
    });
  }

  async run(message: Message, args: string[]) {
    const guild = await message.guild.fetch();
    const channels = await guild.channels.fetch();
    const usersCollection = new Collection<string, number>();

    await Promise.all(
      channels.map(async (channel) => {
        if (!channel.isText()) return;
        let messages = [];
        let message = await channel.messages
          .fetch({ limit: 1 })
          .then((messagePage) =>
            messagePage.size === 1 ? messagePage.at(0) : null
          );

        while (message) {
          await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then((messagePage) => {
              messagePage.forEach((msg) => messages.push(msg));

              // Update our message pointer to be last message in page of messages
              message =
                0 < messagePage.size
                  ? messagePage.at(messagePage.size - 1)
                  : null;
            });
        }

        messages.forEach((msg: Message) => {
          const xp = (usersCollection[msg.author.id] ?? 0) + 100 * 1.25;
          usersCollection[msg.author.id] = xp;
        });
      })
    );

    console.log(usersCollection);
  }
}
