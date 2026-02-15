import { useEffect, useState } from 'react';
import { parse, format } from 'date-fns';
import { client } from '../lib/sanity';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [standaloneGames, setStandaloneGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const data = await client.fetch(
          `{
            "tournaments": *[_type == "tournament" && (!defined(endDate) || endDate >= $today)] | order(startDate asc) {
              _id,
              title,
              startDate,
              endDate,
              locationTbd,
              status,
              notes,
              location-> {
                name,
                address,
                mapUrl,
                parkingInfo,
                notes
              },
              "games": *[_type == "game" && references(^._id) && date >= $today] | order(date asc) {
                _id,
                opponent,
                date,
                startTime
              }
            },
            "standaloneGames": *[_type == "game" && !defined(tournament) && date >= $today] | order(date asc) {
              _id,
              opponent,
              date,
              startTime
            }
          }`,
          { today }
        );

        setTournaments(data.tournaments || []);
        setStandaloneGames(data.standaloneGames || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    return parse(dateString, 'yyyy-MM-dd', new Date());
  };

  const parseLocalDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    const safe = dateTimeString.replace('Z', '');
    return parse(safe, "yyyy-MM-dd'T'HH:mm:ss.SSS", new Date());
  };

  const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return 'No date';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (dateTimeString) => {
    const date = parseLocalDateTime(dateTimeString);
    if (!date) return 'No time';
    return format(date, 'h:mm a');
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'No dates set';
    if (!endDate || startDate === endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getStatusClass = (status) => `status status--${status}`;

  if (loading) return <div className="tournaments"><p>Loading tournaments...</p></div>;
  if (error) return <div className="tournaments"><p>Error: {error}</p></div>;

  return (
    <section className="tournaments">
      <div className="tournaments__container">
        <h1 className="section-title">Tournaments & Games</h1>

        <div className="tournaments__section">
          <h2 className="tournaments__section-title">Tournaments</h2>
          {tournaments.length === 0 ? (
            <p className="tournaments__empty">No tournaments available.</p>
          ) : (
            <div className="tournaments__grid">
              {tournaments.map((tournament) => (
                <div key={tournament._id} className="tournament-card">
                  <div className="tournament-card__header">
                    <h3 className="tournament-card__title">{tournament.title}</h3>
                    <span className={getStatusClass(tournament.status)}>
                      {tournament.status?.replace('_', ' ') || 'upcoming'}
                    </span>
                  </div>

                  <div className="tournament-card__details">
                    <div className="tournament-card__dates">
                      <strong>Dates:</strong> {formatDateRange(tournament.startDate, tournament.endDate)}
                    </div>

                    <div className="tournament-card__location">
                      <strong>Location:</strong>{' '}
                      {tournament.locationTbd
                        ? 'TBD'
                        : tournament.location?.name || 'TBD'}
                      {!tournament.locationTbd && tournament.location?.address && (
                        <p className="tournament-card__address">{tournament.location.address}</p>
                      )}
                      {!tournament.locationTbd && tournament.location?.parkingInfo && (
                        <p className="tournament-card__address">
                          Parking: {tournament.location.parkingInfo}
                        </p>
                      )}
                      {!tournament.locationTbd && tournament.location?.notes && (
                        <p className="tournament-card__address">{tournament.location.notes}</p>
                      )}
                      {!tournament.locationTbd && tournament.location?.mapUrl && (
                        <a
                          href={tournament.location.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tournament-card__map-link"
                        >
                          View on Maps
                        </a>
                      )}
                    </div>

                    {tournament.notes && (
                      <div className="tournament-card__notes">
                        <strong>Notes:</strong>
                        <p>{tournament.notes}</p>
                      </div>
                    )}

                    <div className="tournament-card__games">
                      <strong>Games:</strong>
                      {tournament.games && tournament.games.length > 0 ? (
                        <ul className="tournament-card__games-list">
                          {tournament.games.map((game) => (
                            <li key={game._id} className="tournament-card__game">
                              <span className="tournament-card__game-opponent">
                                vs {game.opponent}
                              </span>
                              <span className="tournament-card__game-time">
                                {formatDate(game.date)} • {formatTime(game.startTime)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="tournament-card__empty">No games scheduled yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tournaments__section">
          <h2 className="tournaments__section-title">Standalone Games</h2>
          {standaloneGames.length === 0 ? (
            <p className="tournaments__empty">No standalone games scheduled.</p>
          ) : (
            <div className="tournaments__games-grid">
              {standaloneGames.map((game) => (
                <div key={game._id} className="game-card">
                  <div className="game-card__header">
                    <h3 className="game-card__title">vs {game.opponent}</h3>
                  </div>
                  <div className="game-card__details">
                    <div className="game-card__date">
                      <strong>Date:</strong> {formatDate(game.date)}
                    </div>
                    <div className="game-card__time">
                      <strong>Time:</strong> {formatTime(game.startTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
