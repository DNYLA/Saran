import { Message } from 'discord.js';
import { FastAverageColor } from 'fast-average-color';
import OwnerOnly from '../../checks/OwnerOnly';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { ArgumentType } from '../../utils/types';
var color = require('dominant-color');

type ArgsTestArguments = {
  targetUserId: string;
  test: string;
  test2: string;
};

export default class ArgsTest extends Command {
  constructor() {
    super('deletemessage', {
      aliases: ['dm'],
      deleteCommand: true,
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      args: [
        {
          name: 'messageID',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: string[], argums: { messageID: string }) {
    console.log(argums);
    try {
      const messageToDelete = await message.channel.messages.fetch(
        argums.messageID
      );
      await messageToDelete.delete();
    } catch (err) {
      console.log(err);
    }
  }
}
