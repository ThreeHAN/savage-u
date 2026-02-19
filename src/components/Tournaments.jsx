import { useEffect, useState } from 'react';
import { parse, format } from 'date-fns';
import { client } from '../lib/sanity';
import { createEvent } from 'ics';

export default function Tournaments({ teamId, teamName, sport }) {
  const [tournaments, setTournaments] = useState([]);
  const [standaloneGames, setStandaloneGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const tournamentFilters = ['_type == "tournament"', '(!defined(endDate) || endDate >= $today)'];
        const gameFilters = ['_type == "game"', 'date >= $today'];
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
              "games": *[_type == "game" && references(^._id) && date >= $today${teamId ? ' && team._ref == $teamId' : ''}] | order(date asc) {
                _id,
                opponent,
                date,
                startTime
              }
            },
            "standaloneGames": *[${gameFilters.join(' && ')} && !defined(tournament)] | order(date asc) {
              _id,
              opponent,
              date,
              startTime
            }
          }`,
          { today, teamId, teamName, sport }
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
    // Parse ISO string and convert to local time
    const date = new Date(dateTimeString);
    return date;
  };

  const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return 'No date';
    return format(date, 'EEE, MMM d');
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

  const formatSport = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  const scheduleTitle = [teamName, formatSport(sport)].filter(Boolean).join(' ');

  const exportToCalendar = () => {
    const events = [];
    
    tournaments.forEach((tournament) => {
      const startDate = parseLocalDate(tournament.startDate);
      const endDate = parseLocalDate(tournament.endDate);
      
      if (startDate) {
        const event = {
          id: tournament._id,
          title: tournament.title,
          description: `Location: ${tournament.location?.name || 'TBD'}${tournament.notes ? `\nNotes: ${tournament.notes}` : ''}`,
          start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()],
          duration: {
            days: endDate && tournament.endDate !== tournament.startDate 
              ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
              : 1
          },
          location: tournament.location?.address || tournament.location?.name || 'TBD'
        };
        events.push(event);
      }
    });

    // Generate calendar file
    const filename = scheduleTitle ? `${scheduleTitle}-tournaments.ics` : 'tournaments.ics';
    const filetype = 'text/plain';
    
    let calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Savage U//Tournament Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${scheduleTitle || 'Tournaments'}
X-WR-TIMEZONE:UTC
`;

    events.forEach((event) => {
      const startDate = event.start;
      const dateStr = `${startDate[0]}${String(startDate[1]).padStart(2, '0')}${String(startDate[2]).padStart(2, '0')}`;
      const now = new Date();
      const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;
      
      calendarContent += `BEGIN:VEVENT
UID:${event.id}@savageu.com
DTSTAMP:${dtstamp}
DTSTART;VALUE=DATE:${dateStr}
DURATION:P${event.duration.days}D
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description}
SEQUENCE:0
END:VEVENT
`;
    });

    calendarContent += `END:VCALENDAR`;

    // Create blob and download
    const blob = new Blob([calendarContent], { type: filetype });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="tournaments"><p>Loading tournaments...</p></div>;
  if (error) return <div className="tournaments"><p>Error: {error}</p></div>;

  return (
    <section className="tournaments">
      <div className="tournaments__container">
        <h2 className="section-title">Tournaments & Games</h2>

        <div className="tournaments__section">
          <div className="tournaments__header">
            <h2 className="tournaments__section-title">Tournaments</h2>
            {tournaments.length > 0 && (
              <button onClick={exportToCalendar} className="tournaments__export-btn">
                Export to Calendar
              </button>
            )}
          </div>
          {tournaments.length === 0 ? (
            <p className="tournaments__empty">No tournaments available.</p>
          ) : (
            <>
              {tournaments[0] && (
                <div className="tournaments__featured">
                  <h3 className="tournaments__featured-label">Next Tournament</h3>
                  <div className="tournament-card">
                    <div className="tournament-card__header">
                      <div className="tournament-card__title-wrapper">
                        <h3 className="tournament-card__title">{tournaments[0].title}</h3>
                        {tournaments[0].website && (
                          <a
                            href={tournaments[0].website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tournament-card__website-icon"
                            title="Visit tournament website"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                          </a>
                        )}
                      </div>
                      <span className={getStatusClass(tournaments[0].status)}>
                        {tournaments[0].status?.replace('_', ' ') || 'upcoming'}
                      </span>
                    </div>

                    <div className="tournament-card__details">
                      <div className="tournament-card__dates">
                        <strong>Dates:</strong> {formatDateRange(tournaments[0].startDate, tournaments[0].endDate)}
                      </div>

                      <div className="tournament-card__location">
                        <strong>Location:</strong>{' '}
                        {tournaments[0].locationTbd
                          ? 'TBD'
                          : tournaments[0].location?.name || 'TBD'}
                        {!tournaments[0].locationTbd && tournaments[0].location?.address && (
                          <a
                            href={tournaments[0].location.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tournament-card__address-link"
                          >
                            {tournaments[0].location.address}
                          </a>
                        )}
                        {!tournaments[0].locationTbd && tournaments[0].location?.parkingInfo && (
                          <p className="tournament-card__address">
                            Parking: {tournaments[0].location.parkingInfo}
                          </p>
                        )}
                        {!tournaments[0].locationTbd && tournaments[0].location?.notes && (
                          <p className="tournament-card__address">{tournaments[0].location.notes}</p>
                        )}
                      </div>

                      {tournaments[0].notes && (
                        <div className="tournament-card__notes">
                          <strong>Notes:</strong>
                          <p>{tournaments[0].notes}</p>
                        </div>
                      )}

                      <div className="tournament-card__games">
                        <strong>Games:</strong>
                        {tournaments[0].games && tournaments[0].games.length > 0 ? (
                          <ul className="tournament-card__games-list">
                            {tournaments[0].games.map((game) => (
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
                </div>
              )}

              {tournaments.length > 1 && (
                <div className="tournaments__upcoming">
                  <h3 className="tournaments__upcoming-label">Upcoming Tournaments</h3>
                  <ul className="tournaments__simple-list">
                    {tournaments.slice(1).map((tournament) => (
                      <li key={tournament._id} className="tournaments__simple-item">
                        <span className="tournaments__simple-title">{tournament.title}</span>
                        <span className="tournaments__simple-date">
                          {formatDateRange(tournament.startDate, tournament.endDate)}
                          {tournament.location?.name && !tournament.locationTbd && (
                            <>
                              {' @ '}
                              <a
                                href={tournament.location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tournaments__simple-location-link"
                              >
                                {tournament.location.name}
                              </a>
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
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
