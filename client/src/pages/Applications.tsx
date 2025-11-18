import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const Applications = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = isAdmin ? '/applications' : '/applications/me';
        const response = await api.get<{ data: Application[] }>(endpoint);
        const data = response.data.data ?? [];
        setApplications(data);
        setSelected(data[0] ?? null);
      } catch (err: any) {
        const message = err?.response?.data?.detail || err?.message || 'Unable to load applications';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAdmin]);

  const getResumeUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const normalized = path.replace(/^\.\//, '').replace(/^\//, '');
    return `${API_BASE_URL.replace(/\/$/, '')}/${normalized}`;
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter((app) => app.status === 'SHORTLISTED').length;
    const hired = applications.filter((app) => app.status === 'HIRED').length;
    return { total, interviewing, hired };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    if (status === 'HIRED') return 'bg-emerald-100 text-emerald-800';
    if (status === 'ACCEPTED') return 'bg-emerald-50 text-emerald-800';
    if (status === 'REJECTED') return 'bg-rose-100 text-rose-800';
    if (status === 'SHORTLISTED') return 'bg-sky-100 text-sky-800';
    return 'bg-amber-100 text-amber-800';
  };

  const getResumeName = (path: string) => {
    if (!path) return 'No file uploaded yet';
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || 'No file uploaded yet';
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    setUpdatingId(`${applicationId}:${status}`);
    try {
      await api.patch(`/applications/${applicationId}`, { status });
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      setSelected((prev) => (prev?.id === applicationId ? { ...prev, status } : prev));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Failed to update status';
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Applications</h1>
          <p className="text-gray-600">
            Review every application submitted across your open roles.
          </p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((application) => (
                  <tr key={application.id} className="text-sm">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{application.job.title}</p>
                      <p className="text-gray-500">{application.job.company}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="font-medium">{application.candidate.name}</p>
                      <p className="text-xs">{application.candidate.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingId === `${application.id}:REJECTED`}
                        onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        {updatingId === `${application.id}:REJECTED` ? 'Rejecting…' : 'Reject'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updatingId === `${application.id}:ACCEPTED`}
                        onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                      >
                        {updatingId === `${application.id}:ACCEPTED` ? 'Accepting…' : 'Accept'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-hero-gradient px-8 py-10 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge className="bg-white/20 text-white">My Applications</Badge>
            <h1 className="text-4xl font-semibold leading-tight">
              Track every application in one calm workspace
            </h1>
            <p className="text-white/80">
              Follow your progress from submission to offer. Watch status updates roll in without
              digging through email threads.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-4 lg:w-auto">
            <div className="rounded-3xl border border-white/20 px-6 py-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-white/70">Applications sent</p>
            </div>
            <div className="rounded-3xl border border-white/20 px-6 py-4 text-center">
              <p className="text-3xl font-bold">{stats.interviewing}</p>
              <p className="text-sm text-white/70">In interviews</p>
            </div>
            <div className="rounded-3xl border border-white/20 px-6 py-4 text-center">
              <p className="text-3xl font-bold">{stats.hired}</p>
              <p className="text-sm text-white/70">Offers won</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Card className="bg-rose-50/70 text-rose-900">
          <p className="text-sm font-medium">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl">Timeline</CardTitle>
            <CardDescription>Select an application to see details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.map((application) => (
              <button
                key={application.id}
                onClick={() => setSelected(application)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selected?.id === application.id
                    ? 'border-primary-200 bg-primary-50/70 shadow'
                    : 'border-white/60 bg-white/70 hover:border-primary-100'
                }`}
              >
                <p className="text-sm font-semibold text-charcoal">{application.job.title}</p>
                <p className="text-xs text-charcoal/70">{application.job.company}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-charcoal/60">
                  <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                  <span className={cn('rounded-full px-2 py-0.5', getStatusBadge(application.status))}>
                    {application.status}
                  </span>
                </div>
              </button>
            ))}
            {applications.length === 0 && (
              <p className="text-sm text-charcoal/60">No applications yet. Start applying!</p>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[360px]">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{selected.job.title}</CardTitle>
                    <CardDescription>{selected.job.company}</CardDescription>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide',
                      getStatusBadge(selected.status)
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-primary-50 p-4">
                    <p className="text-xs uppercase tracking-widest text-charcoal/50">Submitted</p>
                    <p className="mt-1 text-sm text-charcoal/80">
                      {new Date(selected.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-primary-50 p-4">
                    <p className="text-xs uppercase tracking-widest text-charcoal/50">Resume</p>
                    <p className="mt-1 text-sm text-charcoal/80">{getResumeName(selected.resume_path)}</p>
                  </div>
                </div>
                {selected.ai_reasoning && (
                  <div className="rounded-2xl bg-primary-50/70 p-4 text-sm text-primary-900">
                    <p className="font-semibold">AI Screening Notes</p>
                    <p className="mt-1 text-primary-800">{selected.ai_reasoning}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-sm text-charcoal/60">
                  Need help?{' '}
                  <a className="text-primary-600 underline" href="mailto:support@hiring.com">
                    Chat with your talent partner
                  </a>
                </div>
                {getResumeUrl(selected.resume_path) && (
                  <a
                    className="btn-secondary rounded-full px-6 py-3"
                    href={getResumeUrl(selected.resume_path) ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download resume
                  </a>
                )}
              </CardFooter>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-charcoal/60">
              <p>Select an application to view its journey.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Applications;

