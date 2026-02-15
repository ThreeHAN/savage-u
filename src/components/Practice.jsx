import { useEffect, useState } from 'react';
import { parse, format } from 'date-fns';
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
    if (!date) return '';
    return format(date, 'EEE, dd MMM');
  };

  const formatTime = (dateTimeString) => {
    const date = parseLocalDateTime(dateTimeString);
    if (!date) return '';
    return format(date, 'h:mm a');
  };

  const formatTimeNoPeriod = (dateTimeString) => {
    const date = parseLocalDateTime(dateTimeString);
    if (!date) return '';
    return format(date, 'h:mm');
  };

  const isSamePeriod = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    const startDate = parseLocalDateTime(startTime);
    const endDate = parseLocalDateTime(endTime);
    if (!startDate || !endDate) return false;
    return format(startDate, 'a') === format(endDate, 'a');
  };

  const getStatusClass = (status) => {
    return `status status--${status}`;
  };

  if (loading) return <div className="practice"><p>Loading practices...</p></div>;
  if (error) return <div className="practice"><p>Error: {error}</p></div>;

  return (
    <section className="practice">
      <div className="practice__container">
        <h1 className="section-title">Practice Schedule</h1>

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
                      ? ` ${formatTimeNoPeriod(practice.startTime)}`
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
