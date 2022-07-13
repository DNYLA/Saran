import { createClient } from 'redis';

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', async () => {
  console.log('Connected Redis');
  await client.FLUSHDB();
});

client.on('error', (err) => {
  console.log(err);
});

export { client as redis };
