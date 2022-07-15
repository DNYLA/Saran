import { Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('ready');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(client: DiscordClient, message: Message) {
    client.user.setActivity('Spotify', {
      type: 'LISTENING',
      name: 'Youtube',
      url: 'https://www.youtube.com/watch?v=CJOZc02VwJM',
    });

    console.log(`${client.user.username} is running.`);
  }
}
