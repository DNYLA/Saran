import { resolve } from 'path';
import { fetchRecentTracks, fetchTrackInfo } from '../../api/lastfm';

export const getTrackInfo = async (
  username: string,
  artist: string,
  name: string
) => {
  try {
    const { data } = await fetchTrackInfo(username, name, artist);
  } catch (err) {}
};
