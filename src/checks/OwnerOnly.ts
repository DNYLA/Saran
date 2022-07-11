import { Message } from 'discord.js';

export default (message: Message): string[] => [process.env.BOT_OWNER];
