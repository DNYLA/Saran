import DiscordClient from './utils/client';
import path from 'path';
import fs from 'fs';

export async function registerCommands(client: DiscordClient, dir = '') {
  if (dir === '') dir = './commands';

  const filePath = path.join(__dirname, dir);
  const files = await fs.promises.readdir(filePath);

  for (const file of files) {
    if ((await fs.promises.lstat(path.join(filePath, file))).isDirectory()) {
      const newPath = `${path.join(dir, file)}`;
      registerCommands(client, newPath);
    }

    if (file.endsWith('.d.ts')) continue;
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const newPathFileName = path.join(`./${dir}/${file}`).replace(/\\/g, '/');
      const { default: Command } = await import(`./${newPathFileName}`);
      const command = new Command();

      client.commands.set(command.getName(), command);
      command.getAliases().forEach((alias: string) => {
        client.commands.set(alias, command);
      });
    }
  }
}

export async function registerEvents(client: DiscordClient, dir = '') {
  if (dir === '') dir = './events';

  const filePath = path.join(__dirname, dir);
  const files = await fs.promises.readdir(filePath);

  for (const file of files) {
    if ((await fs.promises.lstat(path.join(filePath, file))).isDirectory())
      registerEvents(client, path.join(dir, file));

    if (file.endsWith('.d.ts')) continue;
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const newPathFileName = path.join(`./${dir}/${file}`).replace(/\\/g, '/');
      const { default: Event } = await import(`./${newPathFileName}`);
      const event = new Event();
      client.events.set(event.name, event);
      // client.on(event.getName(), event.run.bind(event, client));
      client.on(event.getName(), event.execute.bind(event, client));
    }
  }
}
