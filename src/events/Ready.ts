import { ActivitiesOptions, Activity, ActivityType, Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('ready');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(client: DiscordClient, message: Message) {
    if (process.env.DISABLED) {
      client.user.setPresence({ status: 'idle' });
    } else
      client.user.setActivity('Spotify', {
        type: ActivityType.Listening,
        name: 'Youtube',
        url: 'https://www.youtube.com/watch?v=CJOZc02VwJM',
      });

    console.log(`${client.user.username} is running.`);
  }
}
