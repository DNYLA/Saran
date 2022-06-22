import DiscordClient from './utils/client';
import { registerCommands, registerCommands2, registerEvents } from './handler';
import * as dotenv from 'dotenv';
import { Intents } from 'discord.js';
dotenv.config();

const intents = new Intents(32767);
const client = new DiscordClient({ intents });

(async () => {
  await registerEvents(client);
  await registerCommands(client);
  await registerCommands2(client);
  await client.login(process.env.BOT_TOKEN);
})();
