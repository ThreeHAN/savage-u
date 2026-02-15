import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Practice from '../components/Practice';
import Tournaments from '../components/Tournaments';
import { client } from '../lib/sanity';

export default function TeamSchedule() {
  const { teamName, sport } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "team" && name == $teamName && sport == $sport][0]{
            _id,
            name,
            sport
          }`,
          { teamName, sport }
        );
        setTeam(data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamName, sport]);

  if (loading) return <div className="tournaments"><p>Loading team...</p></div>;
  if (error) return <div className="tournaments"><p>Error: {error}</p></div>;

  const formatSport = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  const pageTitle = [team?.name || teamName, formatSport(team?.sport || sport)]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <section className="header">
        <div className="practice__container">
          <h1 className="team-page-title">{pageTitle}</h1>
        </div>
      </section>
      <Practice teamId={team?._id} />
      <Tournaments teamId={team?._id} />
    </>
  );
}
