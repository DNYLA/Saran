import { Message } from 'discord.js';
import {
  fetchUser,
  fetchUserAlbums,
  fetchUserArtists,
  fetchUserTracks,
} from '../../api/lastfm';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import prisma from '../../services/prisma';
import Command from '../../utils/base/command';

export default class IndexFM extends Command {
  constructor() {
    super('indexall', {
      requirments: {
        userIDs: OwnerOnly,
      },
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
    });
  }

  async run(message: Message) {
    //TRUNCATE TABLE "UserAlbums" RESTART IDENTITY;

    const users = await prisma.user.findMany({
      where: { lastFMName: { not: null } },
    });

    console.log(users.length);
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const delay = i * 10000;

      setTimeout(async () => {
        const username = user.lastFMName;
        console.log(`Current User: ${username}: ${i}/${users.length}`);
        try {
          //Remove old data -> Rework Only Fetch new? (Dont know if that is possible)
          await prisma.user.update({
            where: { id: user.id },
            data: {
              Tracks: {
                deleteMany: {},
              },
              Albums: {
                deleteMany: {},
              },
              Artists: {
                deleteMany: {},
              },
            },
          });
        } catch (err) {
          message.reply('Error Occured whilst trying to update.');
        }

        await fetchUser(username, user.id);
        await fetchUserTracks(username, user.id);
        await fetchUserArtists(username, user.id);
        await fetchUserAlbums(username, user.id);
        console.log(`Finished Indexing ${username}`);
      }, delay);
    }
  }
}
