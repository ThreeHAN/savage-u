import { useParams } from 'react-router-dom';
import Practice from '../components/Practice';
import Tournaments from '../components/Tournaments';
import { useTeamByName } from '../hooks';

export default function TeamSchedule() {
  const { teamName, sport } = useParams();
  const { data: team, isPending: loading, error } = useTeamByName(teamName, sport);


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
