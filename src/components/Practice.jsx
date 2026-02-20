import { usePractices } from '../hooks';
import { formatDateWithDayFromDateTime, formatTime, formatTimeNoPeriod, isSamePeriod } from '../lib/dateUtils';
import { formatSport, getStatusClass } from '../lib/formatUtils';

export default function Practice({ teamId, teamName, sport }) {
  const { data: practices = [], isPending: loading, error } = usePractices(teamId, teamName, sport);

  const scheduleTitle = [teamName, formatSport(sport)].filter(Boolean).join(' ');

  if (loading) return <div className="practice"><p>Loading practices...</p></div>;
  if (error) return <div className="practice"><p>Error: {error}</p></div>;

  return (
    <section className="practice">
      <div className="practice__container">
        <h2 className="section-title">Practice Schedule</h2>

        {practices.length === 0 ? (
          <p className="practice__empty">No practices scheduled yet.</p>
        ) : (
          <div className="practice__grid">
            {practices.map((practice) => (
              <div key={practice._id} className="practice-card">
                <div className="practice-card__header">
                  <h2 className="practice-card__title">{practice.title}</h2>
                  <span className={getStatusClass(practice.status)}>
                    {practice.status.charAt(0).toUpperCase() + practice.status.slice(1)}
                  </span>
                </div>

                <div className="practice-card__details">
                  <div className="practice-card__summary">
                  {formatDateWithDayFromDateTime(practice.startTime)}
                  {isSamePeriod(practice.startTime, practice.endTime)
                    ? ` ${formatTimeNoPeriod(practice.startTime)}`
                    : ` ${formatTime(practice.startTime)}`}
                    {' - '}
                    {formatTime(practice.endTime)}
                    {practice.location?.name ? (
                      practice.location?.mapUrl ? (
                        <>
                          {' @ '}
                          <a
                            href={practice.location.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="practice-card__location-link"
                          >
                            {practice.location.name}
                          </a>
                        </>
                      ) : (
                        ` @ ${practice.location.name}`
                      )
                    ) : null}
                  </div>

                  {practice.location?.parkingInfo && (
                    <div className="practice-card__address">
                      Parking: {practice.location.parkingInfo}
                    </div>
                  )}
                  {practice.location?.notes && (
                    <div className="practice-card__address">{practice.location.notes}</div>
                  )}

                  {practice.notes && (
                    <div className="practice-card__notes">
                      <strong>Notes:</strong>
                      <p>{practice.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
