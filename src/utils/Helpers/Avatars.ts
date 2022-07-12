import { Message, MessageEmbed } from 'discord.js';

export enum AvatarType {
  Profile,
  GuildProfile,
  Banner,
  GuildBanner,
}

export async function getAvatarEmbed(
  type: AvatarType,
  message: Message,
  targetUserId: string
): Promise<MessageEmbed> {
  const requestedUser = await message.client.users.fetch(targetUserId);
  const guildProfile = await message.guild.members.fetch(targetUserId);

  await requestedUser.fetch(true);
  await guildProfile.fetch(true);

  const avatarUrl = requestedUser.displayAvatarURL({ dynamic: true });
  const guildAvUrl = guildProfile.avatarURL({ dynamic: true });
  const bannerUrl = requestedUser.bannerURL({ dynamic: true });

  let requestedText = '';

  if (targetUserId !== message.author.id) {
    requestedText = `Requested by ${message.author.username}`;
  }

  if (type === AvatarType.Profile) {
    return new MessageEmbed()
      .setImage(`${avatarUrl}?size=1024`)
      .setFooter({ text: requestedText });
  } else if (type === AvatarType.Banner) {
    if (!bannerUrl)
      return new MessageEmbed().setAuthor({ name: 'No Banner Set' });
    return new MessageEmbed()
      .setImage(`${bannerUrl}?size=1024`)
      .setFooter({ text: requestedText });
  } else if (type === AvatarType.GuildProfile) {
    return new MessageEmbed()
      .setImage(`${guildAvUrl ?? avatarUrl}?size=1024`)
      .setFooter({ text: requestedText });
  }
}
