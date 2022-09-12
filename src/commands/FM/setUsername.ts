import { Message, EmbedBuilder } from 'discord.js';
import {
  fetchUser,
  fetchUserAlbums,
  fetchUserArtists,
  fetchUserTracks,
} from '../../api/lastfm';
import StartTyping from '../../hooks/StartTyping';
import { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { CONSTANTS } from '../../utils/constants';
import LastFMCommand from './LastFM';

export default class SetUsername extends LastFMCommand {
  constructor() {
    super('set', {
      // requirments: {
      //   custom: UsernameCheck,
      // },
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Usage: ,lf set <username>',
      arguments: [
        {
          name: 'username',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  //Update this to a transaction
  async run(message: Message, args: { username: string }) {
    const userService = (message.client as DiscordClient).db.users;
    const user = await userService.findById(message.author.id);
    const fmUser = await fetchUser(args.username, message.author.id);

    if (!fmUser) {
      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.WARNING)
        .setDescription(
          `⚠️ <@${message.author.id}>: **${args.username}** is not a valid lastfm user.`
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    const baseDescription = `<a:loading:996589331944841287>  <@${message.author.id}>:  `;
    const embed = new EmbedBuilder()
      .setColor('#49b166')
      .setDescription(
        baseDescription +
          `Indexing tracks for user ${args.username}. You will be notified when finished!`
      );
    const embedMessage = await message.channel.send({ embeds: [embed] });

    try {
      //Delete old/current data
      if (user.lastFMName) {
        await userService.repo.update({
          where: { id: message.author.id },
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
      }

      await userService.updateById(message.author.id, {
        lastFMName: args.username,
      });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.ERROR)
        .setDescription(
          `❌ <@${message.author.id}>: An Unknown error has occured whilst trying to set your username. Contact an administrator if this persists.`
        );
      await message.channel.send({ embeds: [embed] });
    }

    await fetchUserTracks(args.username, message.author.id);
    embed.setDescription(baseDescription + `Indexing Artists!`);
    embedMessage.edit({ embeds: [embed] });

    await fetchUserArtists(args.username, message.author.id);
    embed.setDescription(baseDescription + `Indexing Albums!`);
    embedMessage.edit({ embeds: [embed] });

    await fetchUserAlbums(args.username, message.author.id);
    embed.setDescription(
      `✅ <@${message.author.id}>: Finished! You can now use LastFM commands.`
    );
    embedMessage.edit({ embeds: [embed] });
  }
}
