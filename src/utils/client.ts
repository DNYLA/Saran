import { GuildConfig } from '@prisma/client';
import { Client, ClientOptions, Collection } from 'discord.js';
import Command from './Base/command';
import Event from './base/event';

export default class DiscordClient extends Client {
  private _commands = new Collection<string, Command>();
  private _events = new Collection<string, Event>();

  private _configs = new Array<GuildConfig>();

  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, Command> {
    return this._commands;
  }

  get events(): Collection<string, Event> {
    return this._events;
  }

  getConfig(id: string): GuildConfig {
    return this._configs.find((config) => config.id === id);
  }

  setConfig(config: GuildConfig) {
    const index = this._configs.findIndex((c) => c.id === config.id);

    if (index != -1) this._configs[index] = config;
    else this._configs.push(config);
  }
}
