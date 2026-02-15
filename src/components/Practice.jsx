import { useEffect, useState } from 'react';
import { client } from '../lib/sanity';

export default function Practice() {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "practice"] | order(date asc) {
            _id,
            title,
            date,
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
          }`
        );
        setPractices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (dateTimeString, { withPeriod } = {}) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(withPeriod === false ? { dayPeriod: undefined } : {}),
    });
  };

  const isSamePeriod = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    const start = new Date(startTime).getHours();
    const end = new Date(endTime).getHours();
    const startPeriod = start < 12 ? 'AM' : 'PM';
    const endPeriod = end < 12 ? 'AM' : 'PM';
    return startPeriod === endPeriod;
  };

  const getStatusClass = (status) => {
    return `status status--${status}`;
  };

  if (loading) return <div className="practice"><p>Loading practices...</p></div>;
  if (error) return <div className="practice"><p>Error: {error}</p></div>;

  return (
    <section className="practice">
      <div className="practice__container">
        <h1 className="practice__title">Practice Schedule</h1>

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
                    {formatDate(practice.date)},
                    {isSamePeriod(practice.startTime, practice.endTime)
                      ? ` ${new Date(practice.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }).replace(/\s?[AP]M$/, '')}`
                      : ` ${formatTime(practice.startTime)}`}
                    {' - '}
                    {formatTime(practice.endTime)}
                    {practice.location?.name ? (
                      practice.location?.mapUrl ? (
                        <>
                          {', @ '}
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
                        `, @ ${practice.location.name}`
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
