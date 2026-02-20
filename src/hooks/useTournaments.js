import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/sanity';

export function useTournaments(teamId = null, teamName = null, sport = null) {
  return useQuery({
    queryKey: ['tournaments', teamId, teamName, sport],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const tournamentFilters = ['_type == "tournament"', '(!defined(endDate) || endDate >= $today)'];
      const gameFilters = ['_type == "game"', 'startTime >= $today'];

      if (teamId) {
        tournamentFilters.push('$teamId in teams[]._ref');
        gameFilters.push('team._ref == $teamId');
      } else {
        if (teamName) {
          tournamentFilters.push('teamName == $teamName');
          gameFilters.push('teamName == $teamName');
        }
        if (sport) {
          tournamentFilters.push('sport == $sport');
          gameFilters.push('sport == $sport');
        }
      }

      const data = await client.fetch(
        `{
          "tournaments": *[${tournamentFilters.join(' && ')}] | order(startDate asc) {
            _id,
            title,
            startDate,
            endDate,
            locationTbd,
            status,
            notes,
            website,
            location-> {
              name,
              address,
              mapUrl,
              parkingInfo,
              notes
            },
            "games": *[_type == "game" && references(^._id) && startTime >= $today${teamId ? ' && team._ref == $teamId' : ''}] | order(startTime asc) {
              _id,
              opponent,
              date,
              startTime,
              fieldNumber,
              location-> {
                name
              }
            }
          },
          "standaloneGames": *[${gameFilters.join(' && ')} && !defined(tournament)] | order(startTime asc) {
            _id,
            opponent,
            startTime,
            fieldNumber,
            location-> {
              name
            }
          }
        }`,
        { today, teamId, teamName, sport }
      );

      return data;
    },
  });
}
