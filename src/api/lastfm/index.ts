import axios, { AxiosRequestConfig } from 'axios';

const CONFIG: AxiosRequestConfig = {
  baseURL: `http://ws.audioscrobbler.com/2.0/`,
};
const AXIOS = axios.create(CONFIG); //Axios Uses .defaults.baseURL to set/call the API this way we can change the API URL outside the library.

export const createURL = (method: string, params: string) => {
  return encodeURI(
    `?method=${method}&api_key=${process.env.LASTFM_TOKEN}&format=json&${params}`
  );
};

export const fetchRecentTracks = (username: string, limit: number) =>
  AXIOS.get(
    createURL('user.getrecenttracks', `user=${username}&limit=${limit}`)
  );

export const fetchTrackInfo = (
  username: string,
  trackName: string,
  artist?: string
) =>
  AXIOS.get(
    createURL(
      'track.getInfo',
      `username=${username}&artist=${artist}&track=${trackName}`
    )
  );

export const fetchSearchTrack = (
  username: string,
  trackName: string,
  artist?: string
) => {
  let params = `username=${username}&track=${trackName}&limit=1`;

  if (artist) params += `&artist=${artist}`;

  return AXIOS.get(createURL('track.search', params));
};

export enum Periods {
  'overall' = 'overall',
  '7d' = '7day',
  '1w' = '7day',
  '30d' = '1month',
  '1m' = '1month',
  '3m' = '3month',
  '6m' = '6month',
  '12m' = '12month',
  '1y' = '12month',
}

export const fetchTopArtists = (username: string, period: Periods) =>
  AXIOS.get(
    createURL(
      'user.getTopArtists',
      `username=${username}&period=${period}&limit=10`
    )
  );

export const fetchTopTenTracks = (username: string, period: Periods) =>
  AXIOS.get(
    createURL(
      'user.getTopTracks',
      `username=${username}&period=${period}&limit=10`
    )
  );

export const fetchTopTenAlbums = (username: string, period: Periods) =>
  AXIOS.get(
    createURL(
      'user.getTopAlbums',
      `username=${username}&period=${period}&limit=10`
    )
  );

AXIOS.interceptors.request.use((request) => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});
