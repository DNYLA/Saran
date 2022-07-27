import { registerCommands, registerEvents } from './handler';
import DiscordClient from './utils/client';
import * as dotenv from 'dotenv';
import { GatewayIntentBits, Partials } from 'discord.js';
import { redis } from './utils/redis';
dotenv.config();

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-empty-interface
//   interface Client extends DiscordClient {}
// }

// const intents = new Intents(32767);
// export const client = new DiscordClient({
//   intents: [GatewayIntentBits.Guilds],
// });
export const client = new DiscordClient({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

(async () => {
  await redis.connect();
  await registerEvents(client);
  await registerCommands(client);
  await client.login(process.env.BOT_TOKEN);
})();
