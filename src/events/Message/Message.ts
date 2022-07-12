import { Message } from 'discord.js';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { SaranGuild } from '../../utils/database/Guild';
import { SaranUser } from '../../utils/database/User';
import { getArgsFromMsg } from '../../utils/helpers';

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    const user = await new SaranUser(message.author.id).fetch();
    const guild = await new SaranGuild(message.guildId).fetch();
    const guildUser = await guild.fetchUser(message.member.id);
    const config = guild.config;
    let messageCommand = message.content.toLowerCase();
    guildUser.update({ xp: { increment: 5 } });

    //Replace custom lastfm tag with ,lf
    if (messageCommand.startsWith(user.self.lastFMTag.toLowerCase())) {
      console.log('Hit');
      messageCommand = messageCommand.replace(
        user.self.lastFMTag.toLowerCase(),
        `${config.prefix}np`
      );
    }

    //Not a valid command
    if (!messageCommand.startsWith(config.prefix)) return;
    // If message is only <Prefix>
    if (messageCommand === config.prefix) return; //Command/message is only prefix

    //Re-Write getArgsFromMsg to concat modules which have space names.
    const { commandName, args } = getArgsFromMsg(
      messageCommand,
      config.prefix.length
    );

    const command = client.commands.get(commandName.toLowerCase());
    console.log(commandName);

    if (!command) return; //Invalid Command

    try {
      command.execute(client, message, args);
    } catch (err) {
      console.log(err);
      message.channel.send(
        'There was an error when attempting to execute this command'
      );
    }
  }
}
