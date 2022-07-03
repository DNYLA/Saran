import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

type ArgsTestArguments = {
  targetUserId: string;
  test: string;
  test2: string;
};

export default class ArgsTest extends Command {
  constructor() {
    super('deleteMessage', {
      aliases: ['dm'],
      deleteCommand: true,
      requirments: {
        userIDs: OwnerOnly,
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: [
        {
          name: 'messageID',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { messageID: string }) {
    console.log(args);
    try {
      const messageToDelete = await message.channel.messages.fetch(
        args.messageID
      );
      await messageToDelete.delete();
    } catch (err) {
      console.log(err);
    }
  }
}
