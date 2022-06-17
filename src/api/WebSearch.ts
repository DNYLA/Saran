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
  const options = { page: pageNo };

  return await imageClient.search(query, options);

  // imageClient
  //   .search(query, options)
  //   .then((data) => {
  //     images = data;
  //   })
  //   .catch(console.error);

  // return images;
};
