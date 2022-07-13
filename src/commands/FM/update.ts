import { Message, MessageEmbed } from 'discord.js';
import {
  fetchUserAlbums,
  fetchUserArtists,
  fetchUserTracks,
} from '../../api/lastfm';
import UsernameCheck from '../../checks/UsernameCheck';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { deleteCache } from '../../utils/database/redisManager';

export default class SetUsername extends Command {
  constructor() {
    super('lf update', {
      aliases: ['lf u'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Usage: ,lf update',
    });
  }

  //Currently a replica of ,lf set command will update when i have time however this feature
  //is needed so i will release it like this.
  async run(message: Message) {
    const userService = (message.client as DiscordClient).db.users;
    const user = await userService.findById(message.author.id);
    const username = user.lastFMName;
    if (!username) return message.reply('Set a username with ,lf set');

    try {
      //Remove old data -> Rework Only Fetch new? (Dont know if that is possible)
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
    } catch (err) {
      message.reply('Error Occured whilst trying to update.');
    }

    const baseDescription = `<a:loading:996589331944841287>  <@${message.author.id}>:  `;
    const embed = new MessageEmbed()
      .setColor('#49b166')
      .setDescription(
        baseDescription +
          `Indexing tracks for user ${username}. You will be notified when finished!`
      );
    const embedMessage = await message.channel.send({ embeds: [embed] });
    await fetchUserTracks(username, message.author.id);
    embed.setDescription(baseDescription + `Indexing Artists!`);
    embedMessage.edit({ embeds: [embed] });

    await fetchUserArtists(username, message.author.id);
    embed.setDescription(baseDescription + `Indexing Albums!`);
    embedMessage.edit({ embeds: [embed] });

    await fetchUserAlbums(username, message.author.id);
    embed.setDescription(
      `✅ <@${message.author.id}>: Finished! You can now use LastFM commands.`
    );
    embedMessage.edit({ embeds: [embed] });
  }
}
