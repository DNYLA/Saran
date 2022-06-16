import {
  Emoji,
  Interaction,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionEmoji,
  User,
} from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageReactionAdd extends Event {
  constructor() {
    super('messageReactionAdd');
  }

  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    const config = client.getConfig(reaction.message.guildId);
    if (!config) return; //Configs should auto be fetched whenever a message is sent
    if (!config.reactionBoardChannel) return;
    const guild = reaction.message.guild;
    const message = reaction.message;

    try {
      await message.guild.channels.fetch();
      const channel = message.guild.channels.cache.get(
        config.reactionBoardChannel
      );

      if (!channel) return;
      if (!channel.isText()) return;

      const reactions = message.reactions.cache;
      const sobEmoji = reactions.get('😭');

      if (!sobEmoji) return;
      if (sobEmoji.count != config.reactionBoardLimit) return;
      if (!reaction.message.channel.isText()) return;

      const reactionChannel = await guild.channels.fetch(
        reaction.message.channelId
      );

      const messageEmbed = new MessageEmbed()
        .setColor('#1e7842')
        .setAuthor({
          name: message.author.username,
          url: message.url,
          iconURL: message.author.avatarURL(),
        })
        .addFields(
          {
            name: `#${reactionChannel.name}`,
            value: `[Go To Message](${message.url})`,
            inline: true,
          },
          {
            name: 'Emoji',
            value: `${reaction.emoji.name} x${config.reactionBoardLimit}`,
          }
        )
        .setTimestamp();

      channel.send({ embeds: [messageEmbed] });
    } catch (err) {
      console.log(err);
    }
  }
}
