import { GuildMember, Message, MessageEmbed, User } from 'discord.js';

export enum AvatarType {
  Profile,
  GuildProfile,
  Banner,
  GuildBanner,
}

export async function getAvatarEmbed(
  type: AvatarType,
  message: Message
): Promise<MessageEmbed> {
  const mention = message.mentions.users.first();

  let requestedUser: User = message.author;
  let guildProfile = await message.guild.members.fetch(message.author.id);
  let requestedText = '';

  if (mention) {
    requestedUser = mention;
    requestedText = `Requested by ${message.author.username}`;
  } else if (mention && (AvatarType.GuildProfile || AvatarType.GuildBanner)) {
    guildProfile = await message.guild.members.fetch(mention.id);
  }

  await requestedUser.fetch();

  if (type === AvatarType.Profile) {
    const avatarUrl = requestedUser.displayAvatarURL({ dynamic: true });
    return new MessageEmbed()
      .setImage(`${avatarUrl}?size=1024`)
      .setFooter({ text: requestedText });
  } else if (type === AvatarType.Banner) {
    const bannerUrl = requestedUser.bannerURL({ dynamic: true });
    if (!bannerUrl)
      return new MessageEmbed().setAuthor({ name: 'No Banner Set' });
    return new MessageEmbed()
      .setImage(`${bannerUrl}?size=1024`)
      .setFooter({ text: requestedText });
  } else if (type === AvatarType.GuildProfile) {
    let avatarUrl = guildProfile.avatarURL({ dynamic: true });

    if (avatarUrl)
      return new MessageEmbed()
        .setImage(`${avatarUrl}?size=1024`)
        .setFooter({ text: requestedText });
    else {
      avatarUrl = requestedUser.displayAvatarURL({ dynamic: true });
      return new MessageEmbed()
        .setImage(`${avatarUrl}?size=1024`)
        .setFooter({ text: requestedText });
    }
  }
}
