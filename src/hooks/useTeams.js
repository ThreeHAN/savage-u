import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/sanity';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const data = await client.fetch(`*[_type == "team"] {
        _id,
        name,
        sport,
        image {
          asset-> {
            url
          }
        }
      }`);
      return data;
    },
  });
}
