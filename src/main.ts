import DiscordClient from './utils/client';
import { registerCommands, registerEvents } from './handler';
import * as dotenv from 'dotenv';
import { Intents } from 'discord.js';
dotenv.config();
import { redis } from './utils/redis';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Client extends DiscordClient {}
}

const intents = new Intents(32767);
export const client = new DiscordClient({ intents });

(async () => {
  await redis.connect();
  await registerEvents(client);
  await registerCommands(client);
  await client.login(process.env.BOT_TOKEN);
})();
