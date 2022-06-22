import { GuildConfig } from '@prisma/client';
import { Client, ClientOptions, Collection, Message } from 'discord.js';
import Command from './base/command';
import Command2 from './base/Command2';
import Event from './base/event';
import { WebSearchImage, WebSearchImages } from './types';

export default class DiscordClient extends Client {
  private _commands = new Collection<string, Command>();
  private _commands2 = new Collection<string, Command2>();
  private _events = new Collection<string, Event>();
  private _images = new Collection<string, WebSearchImages>();
  private _configs = new Array<GuildConfig>();
  private _deletedMessages = new Collection<string, Message>();
  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, Command> {
    return this._commands;
  }

  get commands2(): Collection<string, Command2> {
    return this._commands2;
  }

  get events(): Collection<string, Event> {
    return this._events;
  }

  getImage(name: string): WebSearchImages {
    return this._images[name];
    // return this._images.find((image) => image.query === name);
  }

  setImage(images: WebSearchImages) {
    this._images[images.query] = images;
  }

  getConfig(id: string): GuildConfig {
    return this._configs.find((config) => config.id === id);
  }

  setConfig(config: GuildConfig) {
    const index = this._configs.findIndex((c) => c.id === config.id);

    if (index != -1) this._configs[index] = config;
    else this._configs.push(config);
  }

  getDeletedMessage(serverId: string): Message {
    return this._deletedMessages[serverId];
  }

  setDeletedMessage(message: Message) {
    this._deletedMessages[message.guildId] = message;
  }
}
