import { Message } from 'discord.js';
import { getUser } from '../utils/database/User';

export default (message: Message): string[] => [process.env.BOT_OWNER];
