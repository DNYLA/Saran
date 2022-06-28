import { Client, Collection, Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { createGuildMember } from '../../utils/database/User';

export default class IndexLevels extends Command {
  constructor() {
    super('indexlevels', {
      aliases: ['levelsIndex', 'il'],
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'Only bot owner can access this command!',
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      deleteCommand: true,
    });
  }

  async run(message: Message) {
    const guild = await message.guild.fetch();
    const channels = await guild.channels.fetch();
    const usersCollection = new Collection<string, number>();
    const collectionKeys = [];

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
          console.log(messages.length);
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
          if (msg.author.bot) return;

          if (!collectionKeys.includes(msg.author.id))
            collectionKeys.push(msg.author.id);
          const xp = Math.floor(
            (usersCollection[msg.author.id] ?? 0) + 10 * 1.2
          );
          usersCollection[msg.author.id] = xp;
        });
      })
    );

    await Promise.all(
      collectionKeys.map(async (key) => {
        const item = usersCollection[key];
        try {
          const member = await guild.members.fetch(key);
          if (!member || !item) return;
          console.log(`${key}:${item}`);
          await createGuildMember(member, { xp: item });
        } catch (err) {}
      })
    );

    message.reply('Indexed Levels');
  }
}
