import { Collection, Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
        const messages = [];
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
          if (msg.author.bot) return;

          if (!collectionKeys.includes(msg.author.id))
            collectionKeys.push(msg.author.id);

          usersCollection[msg.author.id] =
            (usersCollection[msg.author.id] ?? 0) + 1;
        });
      })
    );

    const db = (message.client as DiscordClient).db;

    await Promise.all(
      collectionKeys.map(async (key) => {
        const level = Math.floor(usersCollection[key] / 250);
        try {
          const member = await guild.members.fetch(key);
          if (!member || !level) return;
          console.log(`${key}:${usersCollection[key]}`);
          await db.guildUsers.repo.upsert({
            where: {
              userId_serverId: { serverId: member.guild.id, userId: member.id },
            },
            create: { level, serverId: member.guild.id, userId: member.id },
            update: { level, xp: 0 },
          });
        } catch (err) {
          console.log(err);
        }
      })
    );

    console.log(usersCollection);
    message.reply('Indexed Levels');
  }
}
