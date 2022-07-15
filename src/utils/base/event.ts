import DiscordClient from '../client';

export default abstract class Event {
  constructor(private name: string) {}

  getName(): string {
    return this.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract run(client: DiscordClient, ...args: any): Promise<void>;

  async execute(client: DiscordClient, ...args: any) {
    console.log('Executing');
    try {
      await this.run(client, ...args);
    } catch (err) {
      console.log(err);
    }
  }
}
