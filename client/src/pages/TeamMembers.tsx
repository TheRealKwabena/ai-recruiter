import './TeamMembers.css';

const TeamMembers = () => {
  return (
    <div className="team-members-page">
      <div className="page-header">
        <h1>Team Members</h1>
        <div className="header-actions">
          <button className="btn-add">Add Team Member</button>
          <input
            type="text"
            placeholder="Search Jobs"
            className="search-input"
          />
          <button className="filter-btn">Filter</button>
        </div>
      </div>
      <div className="team-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="team-card">
            <div className="team-avatar"></div>
            <div className="team-name">John Doe</div>
            <div className="team-role">UI/UX Designer</div>
            <div className="team-company">@company name</div>
            <button className="btn-message">Message</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;

