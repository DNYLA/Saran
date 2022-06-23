import { createClient } from 'redis';

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', async () => {
  console.log('Connected Redis');
  //Whenever the server restarts Players that were currently connected are persited in the cache but their sockets
  //would have disconnected so we delete the whole hastable since it contains old data.
  //the same goes for lobbies however they have a TTL of 5Minutes so they will get removed <= 5 minutes from server restart.
  //it would be much harder to delete lobbies as i woudl have to manually find all keys starting with 'lobby-' and its not
  //worth the server resources to delete them on each restart as it will slow the server initialize time.
  await client.DEL('players');
});

client.on('error', (err) => {
  console.log(err);
});

export { client as redis };
