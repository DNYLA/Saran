import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
import joinImages from 'join-images';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import {
  getTopTenStats,
  getTopTenStatsNoEmbed,
  SearchType,
} from '../../../utils/fmHelpers';
import { TopTenArguments } from '../TopTen/topartists';
const fs = require('fs');

var request = require('request');
// import { request } from 'http';
export default class TopAlbums extends Command {
  constructor() {
    super('lf col', {
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
    const topTen = await getTopTenStatsNoEmbed(message, args, SearchType.Album);

    if (topTen.length === 0) return;
  }
}
