import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createImageUrlBuilder } from '@sanity/image-url';
import { client } from '../lib/sanity';

const builder = createImageUrlBuilder(client);
const urlFor = (source) => builder.image(source).width(800).height(600).fit('crop').auto('format').url();

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "team"] {
            _id,
            name,
            sport,
            image {
              asset-> {
                url
              }
            }
          }`
        );
        
        // Sort teams: baseball first, then by name
        const sortedTeams = data.sort((a, b) => {
          // Baseball comes first
          if (a.sport === 'baseball' && b.sport !== 'baseball') return -1;
          if (a.sport !== 'baseball' && b.sport === 'baseball') return 1;
          
          // Then sort by name
          return a.name.localeCompare(b.name);
        });
        
        setTeams(sortedTeams);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

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
