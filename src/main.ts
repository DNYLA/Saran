import { registerCommands, registerEvents } from './handler';
import DiscordClient from './utils/client';
import * as dotenv from 'dotenv';
import { GatewayIntentBits } from 'discord.js';
import { redis } from './utils/redis';
import { registerFont } from 'canvas';
import { prisma } from './services/prisma';
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

prisma.$connect().then(async () => {
  console.log('Connected to database');
  console.log(process.env.REDIS_HOST);

  //Fonts for image generation
  registerFont('./fonts/anton.ttf', { family: 'Anton' });
  registerFont('./fonts/bernadette.ttf', { family: 'Bernadette' });

  //Initialise Commands/Events
  await registerEvents(client);
  await registerCommands(client);

  //Connect to third party services
  await redis.connect();
  //Login
  await client.login(process.env.BOT_TOKEN);
});
