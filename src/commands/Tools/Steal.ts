import { Message, Util } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class StealEmote extends Command {
  constructor() {
    super('steal', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,steal <emote>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    for (const emojiText of args) {
      const emoji = Util.parseEmoji(emojiText);
      if (emoji.id) {
        const type = emoji.animated ? '.gif' : '.png';
        console.log(emoji.id);
        const url = `https://cdn.discordapp.com/emojis/${emoji.id + type}`;
        await message.guild.emojis.create(url, emoji.name);
        message.reply(`Created emoji :${emoji.name}:`);
      } else {
        message.reply('Invalid Emoji');
      }
    }
  }
}