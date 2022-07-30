import { GuildMember, Message, User } from 'discord.js';
import { ArgumentTypes, RequirmentsType } from './base/command';

export type CommandOptions = {
  aliases?: string[]; //Done
  module?: string;
  isSubcommand?: boolean;
  description?: string;
  errorMessage?: string; //Done
  invalidUsage?: string; //Done
  invalidPermissions?: string; //Done
  invalidRequirments?: string;
  guildOnly?: boolean;
  deleteCommand?: boolean; //Done
  usage?: string[];
  fetchUser?: boolean;
  requirments?: Requirments; //Done
  hooks?: Hooks; //Done
  arguments?: Arguments[];
};

export type Arguments = {
  optional?: boolean;
  default?: string | ((message: Message) => string);
  parse?: (message: Message, args: string[], index: number) => Promise<string>;
  name: string;
  type: ArgumentTypes; //Type is required however
  // type: ArgumentType;
};

export type Argument2 = {
  value: string | string[] | User | GuildMember;
  type: ArgumentType;
};

export enum ArgumentType {
  UserMention,
  String,
  Word,
}

export type ArgumentOptions = {
  required: boolean;
  minAmount: number;
};

export type Argument = {
  key: string;
  prompt?: string;
  type: string;
  default?: string;
};

export type Requirments = {
  userIDs?: ((message: Message) => string[]) | string[] | string;
  roleIDs?: () => string[] | string;
  roleNames?: () => string[] | string[];
  custom?: (msg: Message, args: string[]) => Promise<boolean>;
  permissions?: Permissions;
};

export type Permissions = {
  administrator?: boolean;
  manageMessage?: boolean;
};

export type Hooks = {
  preCommand?: (msg: Message, args: string[]) => void;
  postCheck?: (
    msg: Message,
    args: unknown,
    valid: boolean,
    type: RequirmentsType
  ) => void;
  postExecution?: (valid: boolean) => void;
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

export type GlobalAttributes = {
  user: string;
  totalPages: number;
  page: number;
  total: number;
  perPage: number;
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

export type LastFMUser = {
  name: string;
  image: FMImage[];
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

export type GoogleImagesSearch = {
  query: string;
  currentPos: number;
  requester: string;
  images: WebSearchImage[];
};

export type ReverseImageSearch = {
  query: string;
  currentPos: number;
  requester: string;
  images: { url: string; title: string }[];
};

export type WebSearchImage = {
  link: string;
  snippet: string;
  title: string;
};

export type GoogleImageScrape = {
  url: string;
  source: string;
  title: string;
};
