import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/sanity';

export function useTeamByName(teamName, sport) {
  return useQuery({
    queryKey: ['team', teamName, sport],
    queryFn: async () => {
      const data = await client.fetch(
        `*[_type == "team" && name == $teamName && sport == $sport][0]{
          _id,
          name,
          sport
        }`,
        { teamName, sport }
      );
      return data || null;
    },
    enabled: !!teamName && !!sport,
  });
}
