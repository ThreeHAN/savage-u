import { Link } from 'react-router-dom';
import { createImageUrlBuilder } from '@sanity/image-url';
import { useTeams } from '../hooks';
import { client } from '../lib/sanity';

const builder = createImageUrlBuilder(client);
const urlFor = (source) => builder.image(source).width(800).height(600).fit('crop').auto('format').url();

function Teams() {
  const { data: teamsData = [], isPending: loading, error } = useTeams();
  
  // Sort teams: baseball first, then by name
  const teams = [...teamsData].sort((a, b) => {
    if (a.sport === 'baseball' && b.sport !== 'baseball') return -1;
    if (a.sport !== 'baseball' && b.sport === 'baseball') return 1;
    return a.name.localeCompare(b.name);
  });


  return (
    <section className="teams" id="select-teams">
      <div className="teams-container">
        <h2 className="section-title">SELECT TEAMS</h2>
        {loading && <p className="teams-empty">Loading teams...</p>}
        {error && <p className="teams-empty">Error: {error}</p>}
        {!loading && !error && (
          <div className="teams-grid">
            {teams.map((team) => {
              const formatSport = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
              const title = `${team.name} ${formatSport(team.sport)}`.trim();
              const imageUrl = team.image?.asset?.url || (team.image ? urlFor(team.image) : '');
              const teamPath = `/${encodeURIComponent(team.sport)}/${encodeURIComponent(team.name)}`;

              const cardContent = (
                <>
                  {imageUrl && <img src={imageUrl} alt={title} className="team-image" />}
                  <div className="team-overlay">
                    <h3 className="team-name">{title}</h3>
                  </div>
                </>
              );

              return (
                <Link key={team._id} to={teamPath} className="team-card">
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Teams;
