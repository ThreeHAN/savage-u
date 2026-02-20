import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/sanity';

export function usePractices(teamId = null, teamName = null, sport = null) {
  return useQuery({
    queryKey: ['practices', teamId, teamName, sport],
    queryFn: async () => {
      const filters = ['_type == "practice"'];
      if (teamId) {
        filters.push('$teamId in teams[]._ref');
      } else {
        if (teamName) filters.push('teamName == $teamName');
        if (sport) filters.push('sport == $sport');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      filters.push(`date >= $todayString`);

      const data = await client.fetch(
        `*[
          ${filters.join(' && ')}
        ] | order(startTime asc) {
          _id,
          title,
          startTime,
          endTime,
          location-> {
            name,
            address,
            mapUrl,
            parkingInfo,
            notes
          },
          notes,
          status
        }`,
        { teamId, teamName, sport, todayString }
      );

      return data;
    },
  });
}
