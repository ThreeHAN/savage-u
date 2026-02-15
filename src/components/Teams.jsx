function Teams() {
  const teams = [
    { id: 1, name: '14 U Baseball', image: './savages.jpg' },
    { id: 2, name: 'Softball', image: './lioness.jpg' },
  ];

  return (
    <section className="teams" id="select-teams">
      <div className="teams-container">
        <h2 className="section-title">SELECT TEAMS</h2>
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <img src={team.image} alt={team.name} className="team-image" />
              <div className="team-overlay">
                <h3 className="team-name">{team.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Teams;
