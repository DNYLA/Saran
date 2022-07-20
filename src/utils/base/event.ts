import DiscordClient from '../client';

export default abstract class Event {
  constructor(private name: string) {}

  getName(): string {
    return this.name;
  }

  abstract run(client: DiscordClient, ...args: unknown[]): Promise<void>;

  async execute(client: DiscordClient, ...args: unknown[]) {
    try {
      await this.run(client, ...args);
    } catch (err) {
      console.log(err);
    }
  }
}
