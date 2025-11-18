import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface Job {
  id: string;
  title: string;
  role: string;
  company: string;
  location: string;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  submitted_at: string;
  resume_path: string;
  resume_text: string;
  ai_reasoning?: string;
  job: Job;
  candidate: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  };
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobsResponse = await api.get<{ data: Job[] }>('/jobs');
        setJobs(jobsResponse.data.data ?? []);

        const applicationsEndpoint = isAdmin ? '/applications' : '/applications/me';
        const applicationsResponse = await api.get<{ data: Application[] }>(applicationsEndpoint);
        setApplications(applicationsResponse.data.data ?? []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const hired = applications.filter((app) => app.status === 'HIRED').length;
    const uniqueCandidates = new Set(applications.map((app) => app.candidate.id)).size;

    return {
      totalJobs: jobs.length,
      applicationsReceived: applications.length,
      totalHired: hired,
      candidatePool: isAdmin ? uniqueCandidates : applications.length,
    };
  }, [applications, jobs.length, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          {isAdmin ? 'Monitor your open roles and applicants in one place.' : 'Track your applications and discover new opportunities.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Open Roles', value: stats.totalJobs },
          { title: 'Applications', value: stats.applicationsReceived },
          { title: 'Hires', value: stats.totalHired },
          { title: isAdmin ? 'Candidate Pool' : 'My Submissions', value: stats.candidatePool },
        ].map((card) => (
          <div key={card.title} className="card">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Open roles</h2>
            <button className="text-primary-600 text-sm font-medium" onClick={() => navigate('/jobs')}>
              View all
            </button>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No active jobs yet.</p>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-primary-100 cursor-pointer transition"
                  onClick={() => (isAdmin ? navigate(`/jobs/${job.id}/applications`) : navigate('/jobs'))}
                >
                  <p className="text-lg font-semibold text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.company}</p>
                  <p className="text-xs text-gray-400 mt-1">{job.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isAdmin ? 'Recent applications' : 'My applications'}
            </h2>
            <button className="text-primary-600 text-sm font-medium" onClick={() => navigate('/applications')}>
              View all
            </button>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-gray-500">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{app.job.title}</p>
                      <p className="text-sm text-gray-500">{app.job.company}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'HIRED'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-gray-500 mt-2">
                      Candidate: {app.candidate.name} ({app.candidate.email})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
