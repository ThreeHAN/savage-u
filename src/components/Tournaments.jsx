import { useTournaments } from '../hooks';
import { generateCalendarFile, downloadCalendarFile } from '../lib/calendarExport';
import { parseLocalDate, formatDate, formatTime, formatDateRange } from '../lib/dateUtils';
import { formatSport, getStatusClass } from '../lib/formatUtils';

function TournamentHeader({ onExport, hasTournaments }) {
  return (
    <div className="tournaments__header">
      <h2 className="tournaments__section-title">Tournaments</h2>
      {hasTournaments && (
        <button onClick={onExport} className="tournaments__export-btn">
          Export to Calendar
        </button>
      )}
    </div>
  );
}

function TournamentFeatured({ tournament }) {
  if (!tournament) return null;

  return (
    <div className="tournaments__featured">
      <h3 className="tournaments__featured-label">Next Tournament</h3>
      <div className="tournament-card">
        <div className="tournament-card__header">
          <div className="tournament-card__title-wrapper">
            <h3 className="tournament-card__title">{tournament.title}</h3>
            {tournament.website && (
              <a
                href={tournament.website}
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
            {tournament.locationTbd ? 'TBD' : tournament.location?.name || 'TBD'}
            {!tournament.locationTbd && tournament.location?.address && (
              <a
                href={tournament.location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tournament-card__address-link"
              >
                {tournament.location.address}
              </a>
            )}
            {!tournament.locationTbd && tournament.location?.parkingInfo && (
              <p className="tournament-card__address">
                Parking: {tournament.location.parkingInfo}
              </p>
            )}
            {!tournament.locationTbd && tournament.location?.notes && (
              <p className="tournament-card__address">{tournament.location.notes}</p>
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
                    <span className="tournament-card__game-opponent">vs {game.opponent}</span>
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
  );
}

function TournamentUpcoming({ tournaments }) {
  if (!tournaments || tournaments.length === 0) return null;

  return (
    <div className="tournaments__upcoming">
      <h3 className="tournaments__upcoming-label">Upcoming Tournaments</h3>
      <ul className="tournaments__simple-list">
        {tournaments.map((tournament) => (
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
  );
}

function StandaloneGames({ games }) {
  return (
    <div className="tournaments__section">
      <h2 className="tournaments__section-title">Standalone Games</h2>
      {games.length === 0 ? (
        <p className="tournaments__empty">No standalone games scheduled.</p>
      ) : (
        <div className="tournaments__games-grid">
          {games.map((game) => (
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
  );
}

export default function Tournaments({ teamId, teamName, sport }) {
  const { data = {}, isPending: loading, error } = useTournaments(teamId, teamName, sport);
  const tournaments = data.tournaments || [];
  const standaloneGames = data.standaloneGames || [];

  const scheduleTitle = [teamName, formatSport(sport)].filter(Boolean).join(' ');

  const exportToCalendar = () => {
    const { filename, calendarContent } = generateCalendarFile(tournaments, parseLocalDate, scheduleTitle);
    downloadCalendarFile(filename, calendarContent);
  };

  if (loading) return <div className="tournaments"><p>Loading tournaments...</p></div>;
  if (error) return <div className="tournaments"><p>Error: {error}</p></div>;

  return (
    <section className="tournaments">
      <div className="tournaments__container">
        <h2 className="section-title">Tournaments & Games</h2>

        <div className="tournaments__section">
          <TournamentHeader
            onExport={exportToCalendar}
            hasTournaments={tournaments.length > 0}
          />
          {tournaments.length === 0 ? (
            <p className="tournaments__empty">No tournaments available.</p>
          ) : (
            <>
              <TournamentFeatured tournament={tournaments[0]} />
              <TournamentUpcoming tournaments={tournaments.slice(1)} />
            </>
          )}
        </div>

        <StandaloneGames games={standaloneGames} />
      </div>
    </section>
  );
}
