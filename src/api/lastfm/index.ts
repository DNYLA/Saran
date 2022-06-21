import axios, { AxiosRequestConfig } from 'axios';

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

const CONFIG: AxiosRequestConfig = {
  baseURL: `http://ws.audioscrobbler.com/2.0/`,
};
const AXIOS = axios.create(CONFIG); //Axios Uses .defaults.baseURL to set/call the API this way we can change the API URL outside the library.

export const fetchRecentTracks = (username: string, limit: number) =>
  AXIOS.get(
    new EscapedURI('user.getrecenttracks').addUser(username).addLimit(limit).URI
  );

export const fetchTrackInfo = (
  username: string,
  trackName: string,
  artist?: string
) =>
  AXIOS.get(
    new EscapedURI('track.getInfo')
      .addUsername(username)
      .addTrackName(trackName)
      .addArtist(artist).URI
  );

export const fetchSearchTrack = (
  username: string,
  trackName: string,
  artist?: string
) => {
  const escapedURI = new EscapedURI('track.search')
    .addUsername(username)
    .addTrackName(trackName)
    .addLimit(1);

  if (artist) escapedURI.addArtist(artist);

  return AXIOS.get(escapedURI.URI);
};

export const fetchAlbumInfo = (
  username: string,
  name: string,
  artist: string
) =>
  AXIOS.get(
    new EscapedURI('album.getInfo')
      .addAlbum(name)
      .addArtist(artist)
      .addUsername(username).URI
  );

export const fetchSearchAlbum = (name: string) => {
  return AXIOS.get(new EscapedURI('album.search').addAlbum(name).URI);
};

export const fetchTopArtists = (username: string, period: Periods) =>
  AXIOS.get(
    new EscapedURI('user.getTopArtists')
      .addUsername(username)
      .addPeriod(period)
      .addLimit(10).URI
  );

export const fetchTopTenTracks = (username: string, period: Periods) =>
  AXIOS.get(
    new EscapedURI('user.getTopTracks')
      .addUsername(username)
      .addPeriod(period)
      .addLimit(10).URI
  );

export const fetchTopTenAlbums = (username: string, period: Periods) =>
  AXIOS.get(
    new EscapedURI('user.getTopAlbums')
      .addUsername(username)
      .addPeriod(period)
      .addLimit(10).URI
  );

AXIOS.interceptors.request.use((request) => {
  // console.log('Starting Request', JSON.stringify(request, null, 2));
  console.log('Starting Request', request.url ?? 'Not Available');

  return request;
});

class EscapedURI {
  private uri = '';
  constructor(method: string) {
    this.uri = `?method=${method}&api_key=${process.env.LASTFM_TOKEN}&format=json`;
  }

  addAlbum(name: string): EscapedURI {
    this.uri += this.addField('album', name);
    return this;
  }
  addUser(username: string): EscapedURI {
    this.uri += this.addField('user', username);
    return this;
  }

  addUsername(username: string): EscapedURI {
    this.uri += this.addField('username', username);
    return this;
  }

  addTrackName(trackName: string): EscapedURI {
    this.uri += this.addField('track', trackName);
    return this;
  }

  addArtist(name: string): EscapedURI {
    this.uri += this.addField('artist', name);
    return this;
  }

  addLimit(limit: number): EscapedURI {
    this.uri += this.addField('limit', limit.toString());
    return this;
  }

  addPeriod(period: string): EscapedURI {
    this.uri += this.addField('period', period);
    return this;
  }

  public get URI(): string {
    return this.uri;
  }

  private addField(fieldName: string, value: string) {
    return `&${fieldName}=${encodeURIComponent(value)}`;
  }
}
