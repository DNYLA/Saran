import {
  Emoji,
  GuildChannel,
  Interaction,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionEmoji,
  User,
} from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import {
  createReactionBoardInfo,
  getReactionBoardInfo,
  SaranGuild,
  updateReactionBoardInfo,
} from '../utils/database/Guild';

export default class MessageReactionAdd extends Event {
  constructor() {
    super('messageReactionRemove');
  }

  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    const storedGuild = await new SaranGuild(reaction.message.guildId).fetch();
    const config = storedGuild.config;
    if (!config) return; //Configs should auto be fetched whenever a message is sent
    if (!config.reactionBoardChannel) return;
    const guild = reaction.message.guild;
    const message = await reaction.message.fetch();

    const alreadySet = await getReactionBoardInfo(message.id, guild.id);
    if (!alreadySet) return;
    try {
      await message.guild.channels.fetch();
      const channel = await message.guild.channels.fetch(
        config.reactionBoardChannel
      );
      const reactions = message.reactions.cache;
      const sobEmoji = reactions.get('😭');
      if (!channel) return;
      if (!channel.isText()) return;
      if (reaction.emoji.name != '😭') return;
      if (!sobEmoji) return;

      const reactionChannel = await guild.channels.fetch(
        reaction.message.channelId
      );
      const preSet = await channel.messages.fetch(alreadySet.embedMessageId);
      if (preSet) {
        const messageEmbed = new MessageEmbed()
          .setColor('#1e7842')
          .setAuthor({
            name: message.author.username,
            url: message.url,
            iconURL: message.author.avatarURL(),
          })
          .setDescription(message.content)
          .addFields(
            {
              name: `#${reactionChannel.name}`,
              value: `[Go To Message](${message.url})`,
              inline: true,
            },
            {
              name: 'Emoji',
              value: `${reaction.emoji.name} x${sobEmoji.count ?? 0}`,
            }
          )
          .setFooter({ text: 'Emoji Score: 15' })
          .setTimestamp();
        preSet.edit({ embeds: [messageEmbed] });
        await updateReactionBoardInfo(
          message.id,
          guild.id,
          sobEmoji.count ?? 0
        );
      }
    } catch (err) {
      console.log(err);
      console.log('Caught Error');
    }
  }
}
