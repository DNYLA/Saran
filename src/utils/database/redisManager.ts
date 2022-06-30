import { SearchType } from '../fmHelpers';
import { redis } from '../redis';

const setJson = async (key, object, options) => {
  if (!options) options = {};
  const { ex, path } = options;
  await redis.json.set(key, path ? path : '.', object);

  if (ex) setExpire(key, ex);
};
const getJson = async (key, options) => {
  if (!options) options = {};
  const { ex, path } = options;

  const data = redis.json.get(key, path ? path : '.');
  if (ex) setExpire(key, ex);

  return data;
};

const contructTableName = (name: string, type: SearchType) => {
  let typeText = '-artist';
  if (type === SearchType.Album) typeText = '-album';
  else if (type === SearchType.Track) typeText = '-track';
  return name + typeText;
};

export async function getCachedPlays(
  username: string,
  key: string,
  type: SearchType
) {
  return await redis.HGET(contructTableName(username.toLowerCase(), type), key);
}

export async function setCachedPlays(
  username: string,
  key: string,
  value: number,
  type: SearchType
) {
  return await redis.HSET(
    contructTableName(username.toLowerCase(), type),
    key,
    value
  );
}

export async function deleteCache(key: string) {
  return await redis.del(key);
}

const setExpire = async (key, time) => {
  await redis.expire(key, time);
};
