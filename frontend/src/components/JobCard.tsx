interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    description: string;
    tags: string[];
    matchScore: number;
    posted: string;
    salary?: string;
    type: string;
    level: string;
    apply_url: string;
  };
  onSave: () => void;
  onApply: () => void;
}

export default function JobCard({ job, onSave, onApply }: JobCardProps) {
  // Clean HTML from description
  const cleanDescription = (text: string) => {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .substring(0, 200) + (text.length > 200 ? '...' : ''); // Limit length
  };

  // Format tags to remove duplicates and clean them
  const formatTags = () => {
    const allTags = [job.type, job.level, ...(job.tags || [])].filter(Boolean);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.slice(0, 3); // Show max 3 tags
  };

  const cleanTags = formatTags();

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-company-logo">
          {job.company ? job.company[0].toUpperCase() : '?'}
        </div>
        <div className="job-card-info">
          <h3 className="job-card-title">{job.title || 'Untitled Position'}</h3>
          <div className="job-card-company">{job.company || 'Unknown Company'}</div>
          <div className="job-card-location">
            📍 {job.location || 'Remote'}
          </div>
        </div>
        <div className="job-card-actions">
          <button 
            className="job-action-btn" 
            title="Save" 
            onClick={onSave}
          >
            ❤️
          </button>
        </div>
      </div>

      <div className="job-card-tags">
        {cleanTags.map((tag, i) => (
          <span key={i} className="job-tag">
            {tag}
          </span>
        ))}
        {job.salary && <span className="job-tag">💰 {job.salary}</span>}
      </div>

      <p className="job-card-description">
        {cleanDescription(job.description || 'No description available.')}
      </p>

      <div className="job-card-footer">
        <div className="job-match-score">
          <div className="match-circle">{Math.round(job.matchScore)}%</div>
          <div className="match-label">
            <div style={{ fontWeight: 600, color: "#00f5a0", marginBottom: 2 }}>
              {job.matchScore > 80 ? 'STRONG MATCH' : job.matchScore > 60 ? 'GOOD MATCH' : 'MATCH'}
            </div>
            <div style={{ fontSize: 11 }}>✓ Real Job</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="job-posted">{job.posted || 'Recently'}</div>
          <button 
            className="apply-btn" 
            style={{ marginTop: 8 }}
            onClick={onApply}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}