import { Message, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import {
  getPeriodFromString,
  getTopTenStatsNoEmbed,
  SearchType,
} from '../../../utils/fmHelpers';
import { convertPeriodToText } from '../../../utils/helpers';
import { TopTenArguments } from '../TopTen/topartists';
// import { createCollage } from '@wylie39/image-collage';
import LastFMCommand from '../LastFM';
import { fetchDatabaseUser } from '../../../services/database/user';

export default class AlbumCollage extends LastFMCommand {
  constructor() {
    super('collage', {
      aliases: ['col'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf col <period>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'period',
          type: ArgumentTypes.SINGLE,
          optional: true,
          default: 'overall',
        },
      ],
    });
  }

  async run(message: Message, args: TopTenArguments) {
    return message.reply('Temporarily Disabled');
    const user = await fetchDatabaseUser(args.targetUserId);
    const period = getPeriodFromString(args.period);
    const topTen = await getTopTenStatsNoEmbed(
      message,
      user,
      period,
      SearchType.Album
    );

    const imageUrls = [];
    const noImageUrl =
      'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';
    for (let i = 0; i < topTen.length; i++) {
      if (i === 9) continue;
      const item = topTen[i];
      try {
        const url = item.image[3]['#text'];
        if (url) imageUrls.push(url);
        else imageUrls.push(noImageUrl);
        // const response = await axios.get(url, { responseType: 'arraybuffer' });
        // const buffer = Buffer.from(response.data, 'utf-8');
        // imgbuffers.push(buffer);
      } catch (err) {
        console.log(err);
      }
    }

    // createCollage(imageUrls, 900).then((imageBuffer) => {
    //   const embedTitle = `${user.lastFMName} ${convertPeriodToText(
    //     period
    //   )} top albums`;
    //   const attachment = new AttachmentBuilder(imageBuffer, {
    //     name: 'collage.jpg',
    //   });
    //   const embed = new EmbedBuilder()
    //     .setTitle(embedTitle)
    //     .setImage('attachment://collage.jpg');
    //   message.channel.send({ embeds: [embed], files: [attachment] });
    // });

    if (topTen.length === 0) return;
  }
}
