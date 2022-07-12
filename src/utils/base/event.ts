import DiscordClient from '../client';

export default abstract class Event {
  constructor(private name: string) {}

  getName(): string {
    return this.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract run(client: DiscordClient, ...args: any): Promise<void>;
}
