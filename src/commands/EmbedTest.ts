import { Message } from 'discord.js';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command from '../utils/base/command';
import { CONSTANTS } from '../utils/constants';
import { buildEmbed, EmbedBuilderData } from '../utils/embedbuilder';

export default class EmbedTest extends Command {
  constructor() {
    super('embedtest', {
      aliases: ['et'],
      requirments: {
        userIDs: ['827212859447705610'],
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
    });
  }

  async run(message: Message) {
    const data: EmbedBuilderData = {
      color: CONSTANTS.COLORS.INFO,
      author: {
        name: 'Lamar',
        url: 'https://bastion.traction.one/tools/embedbuilder',
        iconURL:
          'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png',
      },
      title: 'This is life',
      url: 'https://bastion.traction.one/tools/embedbuilder',
      description: 'This is amazing',
      thumbnail:
        'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png',
      fields: [
        {
          name: 'Field',
          value: 'Value',
          inline: false,
        },
        {
          name: 'This is war',
          value: 'Sparta',
          inline: false,
        },
        {
          name: 'Huh',
          value: 'Hooleip',
          inline: true,
        },
      ],
    };

    const name = 'Dan';
    const embed = buildEmbed(
      '{ "description": "${name}", "axaxa": "yes", "color": "#FFFFFF"  }'
    );
    // return message.channel.send({ embeds: [buildEmbed(data)] });
    return message.channel.send({ embeds: [embed] });
  }
}
