import { Message } from 'discord.js';

export default async (message: Message) => {
  await message.channel.sendTyping();
};
