import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/sanity';

export function useCoaching() {
  return useQuery({
    queryKey: ['coaching'],
    queryFn: async () => {
      const data = await client.fetch(`*[_type == "coaching"] {
        _id,
        title,
        description,
        image,
        link,
        buttonText
      }`);
      return data;
    },
  });
}
