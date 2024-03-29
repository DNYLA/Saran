import { EmbedBuilder, MessageReaction, User } from 'discord.js';
import { fetchGuild } from '../services/database/guild';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import {
  createReactionBoardInfo,
  getReactionBoardInfo,
  updateReactionBoardInfo,
} from '../services/database/guild';

export default class MessageReactionAdd extends Event {
  constructor() {
    super('messageReactionAdd');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    // const config = client.getConfig(reaction.message.guildId);
    const config = await fetchGuild(reaction.message.guildId);
    if (!config || !config.reactionBoardChannel) return;
    const guild = await reaction.message.guild.fetch();
    const message = await reaction.message.fetch();

    const alreadySet = await getReactionBoardInfo(message.id, guild.id);

    try {
      const rbChannel = await message.guild.channels.fetch(
        config.reactionBoardChannel
      );

      const reactions = message.reactions.cache;
      const sobEmoji = reactions.get('😭');
      if (!rbChannel) return;
      if (!rbChannel.isTextBased()) return;
      if (reaction.emoji.name != '😭') return;
      const messageChannel = await guild.channels.fetch(
        reaction.message.channelId
      );

      if (alreadySet) {
        try {
          const preSet = await rbChannel.messages.fetch(
            alreadySet.embedMessageId
          );
          if (preSet) {
            const embed = new EmbedBuilder()
              .setColor('#1e7842')
              .setAuthor({
                name: message.author.username,
                url: message.url,
                iconURL: message.author.avatarURL(),
              })
              .setDescription(message.content)
              .addFields(
                {
                  name: `#${messageChannel.name}`,
                  value: `[Go To Message](${message.url})`,
                  inline: true,
                },
                {
                  name: 'Emoji',
                  value: `${reaction.emoji.name} x${sobEmoji.count}`,
                }
              )
              .setFooter({ text: 'Emoji Score: 15' })
              .setTimestamp();
            preSet.edit({ embeds: [embed] });
            await updateReactionBoardInfo(message.id, guild.id, sobEmoji.count);
            return;
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (alreadySet) return;
      if (!sobEmoji) return;
      if (config.reactionBoardLimit > sobEmoji.count) return;
      if (!reaction.message.channel.isTextBased()) return;

      // const attachemnt = reaction.message.attachments.first();
      // console.log(reaction.message.url);
      // if (attachemnt) imageUrl =

      // console.log(attachemnt);

      const embed = new EmbedBuilder()
        .setColor('#1e7842')
        .setAuthor({
          name: message.author.username,
          url: message.url,
          iconURL: message.author.avatarURL(),
        })
        .setDescription(message.content)
        .addFields(
          {
            name: `#${messageChannel.name}`,
            value: `[Go To Message](${message.url})`,
            inline: true,
          },
          {
            name: 'Emoji',
            value: `${reaction.emoji.name} x${sobEmoji.count}`,
          }
        )
        .setFooter({ text: 'Emoji Score: 15' })
        .setTimestamp();

      const sentMessage = await rbChannel.send({ embeds: [embed] });
      await createReactionBoardInfo(
        sobEmoji.count,
        sobEmoji.emoji.name,
        sentMessage.id,
        message
      );
    } catch (err) {
      console.log(err);
    }
  }
}
