import { Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('ready');
  }

  async run(client: DiscordClient, message: Message) {
    client.user.setPresence({
      activities: [{ name: 'Listening to death grips', type: 'PLAYING' }],
      status: 'online',
    });

    client.user.setActivity('Down Below', {
      type: 'LISTENING',
      name: 'Youtube',
      url: 'https://www.youtube.com/watch?v=CJOZc02VwJM',
    });

    console.log(`${client.user.username} is running.`);
  }
}
