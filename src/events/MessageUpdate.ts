import { Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('messageUpdate');
  }

  async run(client: DiscordClient, message: Message) {
    client.setEditedMessage(message);
  }
}
