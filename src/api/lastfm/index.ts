import { Prisma } from '@prisma/client';
import axios, { AxiosRequestConfig } from 'axios';
import { client } from '../../main';
import {
  Album,
  Artist,
  GlobalAttributes,
  PartialUser,
  RecentTrack,
  SearchedItem,
  SearchedTrackOrAlbum,
  TopAlbum,
  TopArtist,
  TopTrack,
  Track,
} from '../../utils/types';

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

AXIOS.interceptors.request.use((request) => {
  // console.log('Starting Request', JSON.stringify(request, null, 2));
  console.log('Starting Request', request.url ?? 'Not Available');

  return request;
});

export async function fetchRecentTracks(
  username: string,
  limit: number
): Promise<{ tracks: RecentTrack[]; user: PartialUser }> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('user.getrecenttracks').addUser(username).addLimit(limit)
        .URI
    );

    return {
      tracks: data.recenttracks.track,
      user: data.recenttracks['@attr'],
    };
  } catch (err) {
    console.log(err);
    return { tracks: [], user: null };
  }
}

export async function fetchUserTracks(
  username: string,
  userId: string
): Promise<TopTrack[]> {
  const tracks: TopTrack[] = [];
  const MAX_PAGES = 5;
  try {
    let currentPage = 1;
    let totalPages = 5;

    for (let i = 0; i < MAX_PAGES; i++) {
      if (currentPage > totalPages) break;

      const { data } = await AXIOS.get(
        new EscapedURI('user.getTopTracks')
          .addUsername(username)
          .addLimit(1000)
          .addPage(currentPage).URI
      );

      const page: TopTrack[] = data.toptracks.track;
      const attributes: GlobalAttributes = data.toptracks['@attr'];

      currentPage = Number(attributes.page) + 1;
      totalPages = Number(attributes.totalPages);
      tracks.push(...page);
    }
  } catch (err) {
    console.log(err);
    return null;
  }

  const strippedTracks: Prisma.UserTracksCreateManyInput[] = [];

  tracks.forEach((track) => {
    strippedTracks.push({
      userId,
      name: track.name,
      artistName: track.artist.name,
      plays: Number(track.playcount),
    });
  });

  try {
    await client.db.tracks.repo.createMany({ data: strippedTracks });
  } catch (err) {
    console.log(err);
  }

  // return {
  //   tracks: data.recenttracks.track,
  //   user: data.recenttracks['@attr'],
  // };

  return tracks;
}

export async function fetchUserArtists(
  username: string,
  userId: string
): Promise<TopArtist[]> {
  const artists: TopArtist[] = [];
  const MAX_PAGES = 5;
  try {
    let currentPage = 1;
    let totalPages = 5;

    for (let i = 0; i < MAX_PAGES; i++) {
      if (currentPage > totalPages) break;

      const { data } = await AXIOS.get(
        new EscapedURI('user.getTopArtists')
          .addUsername(username)
          .addLimit(1000)
          .addPage(currentPage).URI
      );

      const page: TopArtist[] = data.topartists.artist;
      const attributes: GlobalAttributes = data.topartists['@attr'];

      currentPage = Number(attributes.page) + 1;
      totalPages = Number(attributes.totalPages);
      artists.push(...page);
    }
  } catch (err) {
    console.log(err);
    return null;
  }

  const strippedArtists: Prisma.UserArtistsCreateManyInput[] = [];

  artists.forEach((artist) => {
    strippedArtists.push({
      userId,
      name: artist.name,
      plays: Number(artist.playcount),
    });
  });

  console.log(strippedArtists.length);

  try {
    await client.db.artists.repo.createMany({ data: strippedArtists });
  } catch (err) {
    console.log(err);
  }

  console.log(artists.length);

  // return {
  //   tracks: data.recenttracks.track,
  //   user: data.recenttracks['@attr'],
  // };

  return artists;
}

export async function fetchUserAlbums(
  username: string,
  userId: string
): Promise<TopAlbum[]> {
  const albums: TopAlbum[] = [];
  const MAX_PAGES = 5;
  try {
    let currentPage = 1;
    let totalPages = 5;

    for (let i = 0; i < MAX_PAGES; i++) {
      if (currentPage > totalPages) break;

      const { data } = await AXIOS.get(
        new EscapedURI('user.getTopAlbums')
          .addUsername(username)
          .addLimit(1000)
          .addPage(currentPage).URI
      );

      const page: TopAlbum[] = data.topalbums.album;
      const attributes: GlobalAttributes = data.topalbums['@attr'];

      currentPage = Number(attributes.page) + 1;
      totalPages = Number(attributes.totalPages);
      albums.push(...page);
    }
  } catch (err) {
    console.log(err);
    return null;
  }

  const strippedAlbums: Prisma.UserAlbumsCreateManyInput[] = [];

  albums.forEach((album) => {
    strippedAlbums.push({
      userId,
      name: album.name,
      artistName: album.artist.name,
      plays: Number(album.playcount),
    });
  });

  console.log(strippedAlbums.length);

  try {
    await client.db.albums.repo.createMany({ data: strippedAlbums });
  } catch (err) {
    console.log(err);
  }

  console.log(strippedAlbums.length);

  // return {
  //   tracks: data.recenttracks.track,
  //   user: data.recenttracks['@attr'],
  // };

  return albums;
}

export async function fetchTrackInfo(
  username: string,
  trackName: string,
  artist?: string
): Promise<Track> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('track.getInfo')
        .addUsername(username)
        .addTrackName(trackName)
        .addArtist(artist).URI
    );
    return data.track;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchTrack(
  username: string,
  trackName: string,
  artist?: string
): Promise<SearchedTrackOrAlbum> {
  const escapedURI = new EscapedURI('track.search')
    .addUsername(username)
    .addTrackName(trackName)
    .addLimit(1);

  if (artist) escapedURI.addArtist(artist);

  try {
    const { data } = await AXIOS.get(escapedURI.URI);
    if (data.results.trackmatches.track.length === 0) return null;
    return data.results.trackmatches.track[0];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchAlbumInfo(
  username: string,
  name: string,
  artist: string
): Promise<Album> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('album.getInfo')
        .addAlbum(name)
        .addArtist(artist)
        .addUsername(username).URI
    );

    return data.album;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchAlbum(
  name: string
): Promise<SearchedTrackOrAlbum> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('album.search').addAlbum(name).URI
    );

    if (data.results.albummatches.album.length === 0) return null;
    return data.results.albummatches.album[0];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchArtistInfo(
  username: string,
  name: string
): Promise<Artist> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('artist.getInfo').addArtist(name).addUsername(username).URI
    );

    return data.artist;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchArtist(name: string): Promise<SearchedItem> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('artist.search').addArtist(name).URI
    );

    if (data.results.artistmatches.artist.length === 0) return null;
    return data.results.artistmatches.artist[0];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchTopArtists(
  username: string,
  period: Periods
): Promise<TopArtist[]> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('user.getTopArtists')
        .addUsername(username)
        .addPeriod(period)
        .addLimit(10).URI
    );

    return data.topartists.artist;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function fetchTopTenTracks(
  username: string,
  period: Periods
): Promise<TopTrack[]> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('user.getTopTracks')
        .addUsername(username)
        .addPeriod(period)
        .addLimit(10).URI
    );

    return data.toptracks.track;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function fetchTopTenAlbums(
  username: string,
  period: Periods
): Promise<TopAlbum[]> {
  try {
    const { data } = await AXIOS.get(
      new EscapedURI('user.getTopAlbums')
        .addUsername(username)
        .addPeriod(period)
        .addLimit(10).URI
    );

    return data.topalbums.album;
  } catch (err) {
    console.log(err);
    return [];
  }
}

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

  addPage(page: number): EscapedURI {
    this.uri += this.addField('page', page.toString());
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
