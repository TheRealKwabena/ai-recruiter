import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import './Candidates.css';

interface Application {
  id: string;
  status: string;
  submitted_at: string;
  resume_path: string;
  resume_text: string;
  ai_reasoning?: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const MatchingCandidates = () => {
  const { jobId } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await api.get<{ data: Application[] }>('/applications');
        const data = response.data.data ?? [];
        const filteredByJob = jobId ? data.filter((app) => app.job.id === jobId) : data;
        setApplications(filteredByJob);
        if (filteredByJob.length > 0) {
          setSelected(filteredByJob[0]);
        }
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, isAdmin]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'ALL') return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getResumeUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const normalized = path.replace(/^\.\//, '').replace(/^\//, '');
    return `${API_BASE_URL.replace(/\/$/, '')}/${normalized}`;
  };

  return (
    <div className="candidates-page">
      <h1>Applications {jobId ? `for job #${jobId}` : ''}</h1>
      {applications.length === 0 ? (
        <p className="text-sm text-gray-500">No applications yet.</p>
      ) : (
        <div className="candidates-layout">
          <div className="candidates-list">
            <div className="filter-tabs">
              {['ALL', 'PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED'].map((status) => (
                <button
                  key={status}
                  className={statusFilter === status ? 'active' : ''}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'ALL' ? `${applications.length} total` : status}
                </button>
              ))}
            </div>
            <div className="candidates-items">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className={`candidate-item ${selected?.id === app.id ? 'selected' : ''}`}
                  onClick={() => setSelected(app)}
                >
                  <div className="candidate-name">{app.candidate.name}</div>
                  <div className="candidate-location">{app.candidate.email}</div>
                  <div className="candidate-status">{app.status}</div>
                </div>
              ))}
              {filteredApplications.length === 0 && <p className="text-sm text-gray-500">No applications match this filter.</p>}
            </div>
          </div>

          <div className="candidate-detail">
            {!selected ? (
              <p className="text-sm text-gray-500">Select an application to view the details.</p>
            ) : (
              <>
                <div className="candidate-card">
                  <div className="candidate-info">
                    <h2>{selected.candidate.name}</h2>
                    <p>{selected.candidate.email}</p>
                    <p>Applied for: {selected.job.title}</p>
                    <p>{format(new Date(selected.submitted_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="skills-section">
                  <h3>Cover Letter</h3>
                  <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                    {selected.resume_text || 'No resume text extracted yet.'}
                  </p>
                </div>
                {selected.ai_reasoning && (
                  <div className="skills-section">
                    <h3>AI Screening</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.ai_reasoning}</p>
                  </div>
                )}
                <div className="detail-actions">
                  {getResumeUrl(selected.resume_path) ? (
                    <a
                      href={getResumeUrl(selected.resume_path) ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action"
                    >
                      Download resume
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Resume path unavailable.</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Status: <strong>{selected.status}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingCandidates;

