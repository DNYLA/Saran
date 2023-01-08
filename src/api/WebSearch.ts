import axios from 'axios';
import urlRegex from 'url-regex';
import { WebSearchImage } from '../utils/types';

export type GoogleCSEOptions = {
  safeSearch?: boolean;
  searchType?: string;
  pageNumber: number;
  maxResults: number;
};

export class GoogleCSESearch {
  private baseURL = 'https://customsearch.googleapis.com/customsearch/v1?';
  constructor(private apiKey: string, private cseKey: string) {
    if (!apiKey || !cseKey) throw new Error('Provide a CSE or API Key');
  }

  async search(query: string): Promise<WebSearchImage[]> {
    query = query.replace(/\s/g, '+');
    // options.safeSearch = true;
    // options.searchType = 'image';

    const uri =
      this.baseURL +
      this.addField('key', this.apiKey, true) +
      this.addField('cx', this.cseKey) +
      this.addField('searchType', 'image') +
      this.addField('q', query) +
      this.addField('safe', 'active');

    try {
      const { data } = await axios.get(uri);
      return data.items ?? [];
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  private addField(fieldName: string, value: string, noAnd?: boolean) {
    return `${noAnd ? '' : '&'}${fieldName}=${encodeURIComponent(value)}`;
  }
}

export async function getRedditMediaURLS(url: string) {
  const newUrl = `${url}/.json`;
  const response = await axios.get(newUrl);
  const data = response.data;
  const post = data.find((item) => item.data.children[0].kind === 't3').data
    .children[0];
  const info = {
    title: post.data.title,
    subreddit: post.data.subreddit,
    upvotes: post.data.score ?? 0,
  };

  if (!post)
    return {
      urls: [],
      ...info,
    };

  //Not a gallery so we can return the single URL
  if (!post.data.url.includes('gallery'))
    return {
      urls: [post.data.url],
      ...info,
    };

  const metadata = post.data.media_metadata;
  if (!metadata)
    return {
      urls: [],
      ...info,
    };

  const urls = [];
  Object.keys(metadata).map((id) => {
    const image = metadata[id];
    // metadata.forEach((image) => {
    let largest = { url: '', x: 0, y: 0 };
    //We Could manually get first x,y then change the url to 1080 everytime however it is not always certain that
    //the image will be in 1080P which will then lead to some images not being loaded.
    if (!image.p || image.p.length === 0) return;
    image.p.forEach((item) => {
      if (item.x > largest.x && item.y > largest.y) {
        largest = {
          url: item.u,
          x: item.x,
          y: item.y,
        };
      }
    });
    const strippedUrl = largest.url.replaceAll('&amp;', '&');
    urls.push(strippedUrl);
  });

  return {
    urls,
    ...info,
  };
}

export async function getTikTokMediaURLS(url: string) {
  const response = await axios.get(url);
  const body = await response.data;
  const urls = body.match(urlRegex());
  console.log(body);
  console.log(urls.filter((url) => url.includes('https://v')));

  urls.forEach((element) => {
    console.log(element);
  });

  return new Promise<string>((resolve) => {
    resolve(urls!.find((url) => url.startsWith('https://v')));
  });
}
