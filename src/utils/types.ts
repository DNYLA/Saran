import { Message, MessageEmbed } from 'discord.js';

export type CommandOptions = {
  name: string;
  aliases?: string[];
  module: string;
  description: string;
  errorMessage: string | MessageEmbed;
  invalidUsage: string | MessageEmbed;
  invalidPermissions: string | MessageEmbed;
  guildOnly: boolean;
  deleteCommand: boolean;
  examples?: string[];
  usage?: string;
  requirments?: Requirments;
  hooks?: Hooks;
};

export type Argument = {
  key: string;
  prompt?: string;
  type: string;
  default?: string;
};

export type Requirments = {
  userIDs?: () => string[] | string[];
  roleIDs?: () => string[] | string[];
  roleNames?: () => string[] | string[];
  custom?: () => string;
  permissions?: Permissions;
};

export type Permissions = {
  administrator?: boolean;
  manageMessage?: boolean;
};

export type Hooks = {
  preCommand?: () => void;
  postCheck?: () => void;
  postExecution?: () => void;
  postCommand?: () => void;
};

export type RecentTrack = {
  name: string;
  url: string;
  streamable: number;
  mbid?: string;
  artist: RecentInfo;
  album: RecentInfo;
  date: FMTimestamp;
  image: FMImage[];
  '@atrr': { nowplaying: boolean };
};

export type RecentInfo = {
  '#text': string;
  mbid?: string;
};

export type Track = {
  name: string;
  url: string;
  duration: string;
  listeners: number;
  playcount: number;
  userplaycount: number;
  userloved: number;
  artist: PartialArtist;
  album: PartialAlbum;
};

export type Album = {
  name: string;
  artist: string;
  url: string;
  userplaycount: number;
  mbid?: string;
  tracks: AlbumTrack[];
  image: FMImage[];
};

export type Artist = {
  name: string;
  url: string;
  ontour: boolean;
  stats: { listeners: number; playcount: number; userplaycount: number };
  image: FMImage[];
};

export type AlbumTrack = {
  name: string;
  url: string;
  duration: number;
  artist: PartialArtist;
  '@attr': { rank: number };
};

export type PartialArtist = {
  name: string;
  url: string;
  mbid?: string;
};

export type PartialAlbum = {
  artist: string;
  title: string;
  url: string;
  image?: FMImage[];
};

export type SearchedItem = {
  name: string;
  url: string;
  images?: FMImage[];
};

export type SearchedTrackOrAlbum = SearchedItem & {
  artist: string;
};

export type PartialUser = {
  user: number;
  totalPages: number;
  page: number;
  perPage: number;
  total: number;
};

export type TopTrack = {
  name: string;
  url: string;
  playcount: number;
  artist: PartialArtist;
  image: FMImage[];
};

export type TopArtist = PartialArtist & {
  playcount: number;
  image: FMImage[];
};

export type TopAlbum = {
  name: string;
  url: string;
  playcount: number;
  artist: PartialArtist;
  image: FMImage[];
};

export type ArtistInfo = {
  name: string;
  playcount: string;
  url: string;
  image: FMImage[];
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
