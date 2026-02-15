function Coaching() {
  return (
    <section className="coaching" id="private-lessons">
      <div className="coaching-container">
        <h2 className="section-title">PRIVATE LESSONS</h2>
        <div className="coaching-content">
          <div className="coach-image-wrapper">
            <img 
              src="/coach-dre.jpg" 
              alt="Coach Dre" 
              className="coach-image"
            />
          </div>
          <div className="coach-info">
            <h3 className="coach-name">Coach Dre</h3>
            <p className="coach-tagline">Master Your Game.</p>
            <p className="coach-tagline">Personalized Training</p>
            <button className="coach-button">MEET COACH DRE</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Coaching;
