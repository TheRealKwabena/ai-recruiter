import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import './Jobs.css';

interface Job {
  id: string;
  title: string;
  location?: string;
  salary?: string;
  postedAt?: string;
  _count: {
    applications: number;
  };
}

const ArchivedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs', {
        params: { status: 'ARCHIVED' },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await api.get('/jobs', {
        params: { status: 'ARCHIVED', search },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="jobs-page">
      <div className="page-header">
        <div>
          <h1>Archived Jobs</h1>
          <p className="subtitle">Showing {jobs.length} of {jobs.length}</p>
        </div>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search Jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button className="filter-btn">Filter</button>
        </div>
      </div>

      <div className="jobs-table">
        <div className="table-header">
          <div>Title</div>
          <div>Location</div>
          <div>Salary</div>
          <div>Date Posted</div>
          <div>Applications Received</div>
        </div>
        {jobs.map((job) => (
          <div
            key={job.id}
            className="table-row"
            onClick={() => navigate(`/jobs/${job.id}/candidates`)}
          >
            <div>{job.title}</div>
            <div>{job.location || 'N/A'}</div>
            <div>{job.salary || 'N/A'}</div>
            <div>
              {job.postedAt
                ? format(new Date(job.postedAt), 'MMM dd, yyyy')
                : 'N/A'}
            </div>
            <div>{job._count.applications}</div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="empty-state">No archived jobs found</div>
        )}
      </div>
    </div>
  );
};

export default ArchivedJobs;

