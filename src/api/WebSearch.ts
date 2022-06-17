import axios, { AxiosRequestConfig } from 'axios';
import { WebSearchImage } from '../utils/types';

const CONFIG: AxiosRequestConfig = {
  baseURL: `https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/`,
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
    'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
  },
};

const AXIOS = axios.create(CONFIG); //Axios Uses .defaults.baseURL to set/call the API this way we can change the API URL outside the library.

export const fetchQueryImages = (query: string, pageNo: number) => {
  return AXIOS.get('Search/ImageSearchAPI', {
    params: { q: query, pageNumber: pageNo, pageSize: 50, autoCorrect: true },
  });
};
