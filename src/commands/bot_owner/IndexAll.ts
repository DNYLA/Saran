import { Message } from 'discord.js';
import {
  fetchUser,
  fetchUserAlbums,
  fetchUserArtists,
  fetchUserTracks,
} from '../../api/lastfm';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
    const client = message.client as DiscordClient;
    const guild = await client.guilds.fetch(message.guildId);

    const users = await client.db.users.repo.findMany({
      where: { lastFMName: { not: null } },
    });

    const userService = (message.client as DiscordClient).db.users;

    console.log(users.length);
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const delay = i * 10000;

      setTimeout(async () => {
        const username = user.lastFMName;
        console.log(`Current User: ${username}: ${i}/${users.length}`);
        try {
          //Remove old data -> Rework Only Fetch new? (Dont know if that is possible)
          await userService.repo.update({
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

    // } else if (args.type === 'clearTracks') {
    //   await client.db.tracks.repo.deleteMany({});
    //   await client.db.artists.repo.deleteMany({});
    //   await client.db.albums.repo.deleteMany({});
    // }
  }
}
