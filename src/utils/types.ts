export type RecentTrack = {
  artist: RecentArtist;
  streamable: number;
  image: FMImage[];
  album: RecentAlbum;
  name: string;
  url: string;
  date: FMTimestamp;
};

export type PartialUser = {
  user: string;
  totalPages: string;
  total: string;
};

export type Track = {
  name: string;
  url: string;
  duration: string;
  listeners: number;
  playcount: number;
  userplaycount: number;
  userloved: string;
  artist: Artist;
  album: Album;
};

export type Artist = {
  name: string;
  mbid: string;
  url: string;
};

export type Album = {
  artist: string;
  title: string;
  url: string;
  image: FMImage[];
};

export type RecentArtist = {
  '#text': string;
};

export type RecentAlbum = {
  '#text': string;
};

export type FMTimestamp = {
  uts: string;
  '#text': string;
};

type FMImage = {
  size: string;
  '#text': string;
};

export type WebSearchImages = {
  query: string;
  currentPos: number;
  requester: string;
  images: WebSearchImage[];
};

export type WebSearchImage = {
  url: string;
  thumbnail: string;
  snippet: string;
};
