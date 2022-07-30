import { Message, EmbedBuilder } from 'discord.js';

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
): Promise<EmbedBuilder> {
  const requestedUser = await message.client.users.fetch(targetUserId);
  const guildProfile = await message.guild.members.fetch(targetUserId);

  await requestedUser.fetch(true);
  await guildProfile.fetch(true);

  const avatarUrl = requestedUser.displayAvatarURL();
  const guildAvUrl = guildProfile.avatarURL();
  const bannerUrl = requestedUser.bannerURL();

  let requestedText = '';

  if (targetUserId !== message.author.id) {
    requestedText = `Requested by ${message.author.username}`;
  }

  if (type === AvatarType.Profile) {
    return new EmbedBuilder().setImage(`${avatarUrl}?size=1024`);
    // .setFooter({ text: requestedText });
  } else if (type === AvatarType.Banner) {
    if (!bannerUrl)
      return new EmbedBuilder().setAuthor({ name: 'No Banner Set' });
    return new EmbedBuilder().setImage(`${bannerUrl}?size=1024`);
    // .setFooter({ text: requestedText });
  } else if (type === AvatarType.GuildProfile) {
    return new EmbedBuilder().setImage(`${guildAvUrl ?? avatarUrl}?size=1024`);
    // .setFooter({ text: requestedText });
  }
}
