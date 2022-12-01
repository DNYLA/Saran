import { Client, ClientOptions, Collection, Message } from 'discord.js';
import Command from './base/command';
import Event from './base/event';
import { DatabaseManager } from './database/DatabaseManager';
import { GoogleImagesSearch, ReverseImageSearch } from './types';

export type Riddle = {
  riddle: string;
  answer: string;
  owner?: string;
};
export default class DiscordClient extends Client {
  private _commands = new Collection<string, Command>();
  private _events = new Collection<string, Event>();
  private _images = new Collection<string, GoogleImagesSearch>();
  private _reverseImages = new Collection<string, ReverseImageSearch>();
  // private _configs = new Array<GuildConfig>();
  private _deletedMessages = new Collection<string, Message>();
  private _editedMessages = new Collection<string, Message>();
  private _riddles = new Collection<string, Riddle>();
  private _database = new DatabaseManager();
  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, Command> {
    return this._commands;
  }

  get events(): Collection<string, Event> {
    return this._events;
  }

  get db(): DatabaseManager {
    return this._database;
  }

  getImage(name: string): GoogleImagesSearch {
    return this._images[name];
    // return this._images.find((image) => image.query === name);
  }

  setImage(images: GoogleImagesSearch) {
    this._images[images.query] = images;
  }

  getReverseImage(url: string): ReverseImageSearch {
    return this._reverseImages[url];
  }

  setReverseImage(image: ReverseImageSearch) {
    this._reverseImages[image.query] = image;
  }

  // getConfig(id: string): GuildConfig {
  //   return this._configs.find((config) => config.id === id);
  // }

  // setConfig(config: GuildConfig) {
  //   const index = this._configs.findIndex((c) => c.id === config.id);

  //   if (index != -1) this._configs[index] = config;
  //   else this._configs.push(config);
  // }

  getDeletedMessage(serverId: string): Message {
    return this._deletedMessages[serverId];
  }

  getEditedMessage(serverId: string): Message {
    return this._editedMessages[serverId];
  }

  setDeletedMessage(message: Message) {
    this._deletedMessages[message.guildId] = message;
  }

  setEditedMessage(message: Message) {
    this._editedMessages[message.guildId] = message;
  }

  getRiddle(serverId: string): Riddle {
    return this._riddles[serverId];
  }

  setRiddle(serverId: string, riddle: Riddle) {
    this._riddles[serverId] = riddle;
  }
}
