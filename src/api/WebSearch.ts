import axios from 'axios';
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
