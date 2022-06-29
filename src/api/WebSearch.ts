import axios from 'axios';
import { WebSearchImage } from '../utils/types';

const imageSearch = require('image-search-google');

const imageClient = new imageSearch(
  process.env.GOOGLE_CSE_ID,
  process.env.GOOGLE_API_KEY
);

export const fetchQueryImages = async (
  query: string,
  pageNo: number
): Promise<WebSearchImage[]> => {
  const options = { pageNo: pageNo };

  return await imageClient.search(query, options);

  // imageClient
  //   .search(query, options)
  //   .then((data) => {
  //     images = data;
  //   })
  //   .catch(console.error);

  // return images;
};

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

  async search(query: string, options?: GoogleCSEOptions) {
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

    console.log(uri);
    try {
      const { data } = await axios.get(uri);
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private addField(fieldName: string, value: string, noAnd?: boolean) {
    return `${noAnd ? '' : '&'}${fieldName}=${encodeURIComponent(value)}`;
  }
}
