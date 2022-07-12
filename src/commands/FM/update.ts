import { Message } from 'discord.js';
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
  //This will be reworked to fetch data however as of right now there is no point
  async run(message: Message) {
    const user = await (
      message.client as DiscordClient
    ).database.users.findById(message.author.id);
    const username = user.lastFMName;
    if (!username) return message.reply('Finished updating.');

    console.log(username + '-album');
    await deleteCache(username.toLowerCase() + '-album');
    await deleteCache(username.toLowerCase() + '-track');
    await deleteCache(username.toLowerCase() + '-artist');

    return message.reply('Cleared Cache');
  }
}
