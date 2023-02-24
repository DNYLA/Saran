import { Message } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (message: Message): string[] => process.env.BOT_OWNER.split(',');
