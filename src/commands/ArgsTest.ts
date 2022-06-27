import { Message } from 'discord.js';
import { FastAverageColor } from 'fast-average-color';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../utils/argsparser';
import Command from '../utils/base/command';
import { ArgumentType } from '../utils/types';
var color = require('dominant-color');
export default class ArgsTest extends Command {
  constructor() {
    super('ag', {
      requirments: {
        custom: UsernameCheck,
        permissions: {
          administrator: false,
          manageMessage: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
        postCommand: () => console.log('Finished Executing'),
      },
      args: [
        {
          parse: MentionUserId,
          default: SelfUserId,
        },
      ],
    });
  }

  async run(message: Message, args: string[]) {
    console.log(args);

    const fac = new FastAverageColor();

    fac
      .getColorAsync(
        'https://lastfm.freetls.fastly.net/i/u/300x300/f310973ef4c25bb7d3640303733a7a91.jpg'
      )
      .then((color) => {
        console.log('Average color', color);
      })
      .catch((e) => {
        console.log(e);
      });

    return message.reply('Pong');
  }
}
