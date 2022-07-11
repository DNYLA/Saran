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
    super('messageReactionAdd');
  }

  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    // const config = client.getConfig(reaction.message.guildId);
    const storedGuild = await client.database.guild(reaction.message.guildId);
    const config = storedGuild.config;
    if (!config) return; //Configs should auto be fetched whenever a message is sent
    if (!config.reactionBoardChannel) return;
    const guild = reaction.message.guild;
    const message = await reaction.message.fetch();

    const alreadySet = await getReactionBoardInfo(message.id, guild.id);

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
      const reactionChannel = await guild.channels.fetch(
        reaction.message.channelId
      );

      if (alreadySet) {
        try {
          const preSet = await channel.messages.fetch(
            alreadySet.embedMessageId
          );
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
                  value: `${reaction.emoji.name} x${sobEmoji.count}`,
                }
              )
              .setFooter({ text: 'Emoji Score: 15' })
              .setTimestamp();
            preSet.edit({ embeds: [messageEmbed] });
            await updateReactionBoardInfo(message.id, guild.id, sobEmoji.count);
            return;
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (!sobEmoji) return;
      if (sobEmoji.count < config.reactionBoardLimit) return;
      if (!reaction.message.channel.isText()) return;

      let imageUrl;

      // const attachemnt = reaction.message.attachments.first();
      // console.log(reaction.message.url);
      // if (attachemnt) imageUrl =

      // console.log(attachemnt);

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
            value: `${reaction.emoji.name} x${sobEmoji.count}`,
          }
        )
        .setFooter({ text: 'Emoji Score: 15' })
        .setTimestamp();

      const sentMessage = await channel.send({ embeds: [messageEmbed] });
      await createReactionBoardInfo(
        sobEmoji.count,
        sobEmoji.emoji.name,
        sentMessage.id,
        message
      );
    } catch (err) {
      console.log(err);
      console.log('Caught Error');
    }
  }
}
