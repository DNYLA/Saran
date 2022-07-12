import { Message } from 'discord.js';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { getArgsFromMsg } from '../../utils/helpers';

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    const db = client.database;
    const user = await db.users.findById(message.author.id);
    const config = await db.guilds.findById(message.guildId);

    let messageCommand = message.content.toLowerCase();
    db.guildUsers.updateById(message.guildId, user.id, {
      xp: { increment: 5 },
    }); //No point of awaiting this data not needed

    //Replace custom lastfm tag with ,lf
    //Update to allow it to replace lf instead
    if (messageCommand.startsWith(user.lastFMTag.toLowerCase())) {
      messageCommand = messageCommand.replace(
        user.lastFMTag.toLowerCase(),
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
