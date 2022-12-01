import axios from 'axios';
import { Riddle } from '../utils/client';

async function getRiddle() {
  const { data } = await axios.get<Riddle>(
    'https://riddles-api.vercel.app/random'
  );

  if (!data) return null;
  console.log(data);
  if (data.answer.split(' ').length > 2)
    return await getRiddle(); //Dont fetch riddles longer than 2 words
  else return data;
}

export { getRiddle };
