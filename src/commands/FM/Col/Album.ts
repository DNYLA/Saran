import axios from 'axios';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { getUser } from '../../../utils/database/User';
import {
  getPeriodFromString,
  getTopTenStats,
  getTopTenStatsNoEmbed,
  SearchType,
} from '../../../utils/fmHelpers';
import { convertPeriodToText } from '../../../utils/helpers';
import { TopTenArguments } from '../TopTen/topartists';
const { createCollage } = require('@wylie39/image-collage');
const fs = require('fs');

var request = require('request');
// import { request } from 'http';
export default class TopAlbums extends Command {
  constructor() {
    super('lf col', {
      aliases: ['lf collage'],
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
    const user = await getUser(args.targetUserId);
    const period = getPeriodFromString(args.period);

    const topTen = await getTopTenStatsNoEmbed(
      message,
      user,
      period,
      SearchType.Album
    );

    const imageUrls = [];
    const imgbuffers = [];
    for (let i = 0; i < topTen.length; i++) {
      if (i === 9) continue;
      const item = topTen[i];
      try {
        const url = item.image[3]['#text'];
        imageUrls.push(url);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'utf-8');
        imgbuffers.push(buffer);
      } catch (err) {
        console.log(err);
      }
    }

    createCollage(imageUrls, 900).then((imageBuffer) => {
      const embedTitle = `${user.lastFMName} ${convertPeriodToText(
        period
      )} top albums`;
      const attachment = new MessageAttachment(imageBuffer, 'collage.jpg');
      const embed = new MessageEmbed()
        .setTitle(embedTitle)
        .setImage('attachment://collage.jpg');
      message.channel.send({ embeds: [embed], files: [attachment] });
    });

    if (topTen.length === 0) return;
  }
}
