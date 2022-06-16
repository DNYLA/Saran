import axios, { AxiosRequestConfig } from 'axios';

const CONFIG: AxiosRequestConfig = {
  baseURL: `http://ws.audioscrobbler.com/2.0/`,
};
const AXIOS = axios.create(CONFIG); //Axios Uses .defaults.baseURL to set/call the API this way we can change the API URL outside the library.

export const createURL = (method: string, params: string) => {
  return `?method=${method}&api_key=${process.env.LASTFM_TOKEN}&format=json&${params}`;
};

export const getRecentTracks = (username: string, limit: number) =>
  AXIOS.get(
    createURL('user.getrecenttracks', `user=${username}&limit=${limit}`)
  );

export const getTrackInfo = (
  username: string,
  artist: string,
  trackName: string
) =>
  AXIOS.get(
    createURL(
      'track.getInfo',
      `username=${username}&artist=${artist}&track=${trackName}`
    )
  );
