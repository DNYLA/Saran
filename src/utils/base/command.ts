import { GuildConfig } from '@prisma/client';
import { Message } from 'discord.js';
import DiscordClient from '../client';

export default abstract class Command {
  constructor(
    private name: string,
    private module: string,
    private aliases: string[]
  ) {}

  getName(): string {
    return this.name;
  }

  getModule(): string {
    return this.module;
  }

  getAliases(): string[] {
    return this.aliases;
  }

  abstract run(
    client: DiscordClient,
    message: Message,
    args: string[],
    guildConfig?: GuildConfig
  ): Promise<Message> | Promise<void>;
}
