import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Job {
  id: string;
  title: string;
  role: string;
  description: string;
  company: string;
  location: string;
  created_at: string;
  required_skills?: string[];
  required_certifications?: string[];
}

const focusMap: Record<string, string[]> = {
  All: [],
  Product: ['product', 'manager'],
  Design: ['design', 'ux', 'ui'],
  Engineering: ['engineer', 'developer'],
  Marketing: ['marketing', 'growth'],
};

const workModes = ['Any', 'Remote', 'Onsite', 'Hybrid'];

const ActiveJobs = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [focusFilter, setFocusFilter] = useState('All');
  const [workFilter, setWorkFilter] = useState('Any');
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await api.get<{ data: Job[] }>('/jobs');
        setJobs(response.data.data ?? []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const remote = jobs.filter((job) => job.location?.toLowerCase().includes('remote')).length;
    const newest = [...jobs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    return {
      total: jobs.length,
      remote,
      newest: newest?.title,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.role.toLowerCase().includes(query)
        );
      })
      .filter((job) => {
        if (focusFilter === 'All') return true;
        const keywords = focusMap[focusFilter];
        return keywords.some((word) => job.role.toLowerCase().includes(word));
      })
      .filter((job) => {
        if (workFilter === 'Any') return true;
        const location = job.location.toLowerCase();
        if (workFilter === 'Remote') return location.includes('remote');
        if (workFilter === 'Onsite') return !location.includes('remote');
        if (workFilter === 'Hybrid') return location.includes('hybrid');
        return true;
      });
  }, [jobs, search, focusFilter, workFilter]);

  const resetForm = () => {
    setCoverLetter('');
    setSkillsInput('');
    setCertInput('');
    setResumeFile(null);
  };

  const handleApply = async () => {
    if (!applyJob || !resumeFile) {
      setFeedback({ type: 'error', message: 'Please attach your resume.' });
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    const certifications = certInput
      .split(',')
      .map((cert) => cert.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append('cover_letter', coverLetter);
    if (skills.length === 0) {
      formData.append('skills', '');
    } else {
      skills.forEach((skill) => formData.append('skills', skill));
    }
    if (certifications.length === 0) {
      formData.append('certifications', '');
    } else {
      certifications.forEach((cert) => formData.append('certifications', cert));
    }
    formData.append('resume_file', resumeFile);

    setSubmitting(true);
    setFeedback(null);

    try {
      await api.post(`/applications/apply/${applyJob.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFeedback({ type: 'success', message: 'Application submitted successfully.' });
      setApplyJob(null);
      resetForm();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to submit application';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-[36px] bg-hero-gradient px-8 py-12 text-white lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Badge className="bg-white/20 text-white">Curated Open Roles</Badge>
          <h1 className="text-4xl font-semibold leading-tight">
            Discover roles vetted by our talent partners
          </h1>
          <p className="text-white/80">
            Browse positions that are actively hiring today. Filter by craft, work mode, or search by skill
            to see only the opportunities that match your ambitions.
          </p>
          <div className="flex flex-col gap-4 rounded-3xl bg-white/15 p-4 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search role, skill, or company"
                className="bg-white/95 text-charcoal"
              />
              <Button
                variant="secondary"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Refine search
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(focusMap).map((focus) => (
                <button
                  key={focus}
                  onClick={() => setFocusFilter(focus)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    focusFilter === focus ? 'bg-white text-primary-700' : 'bg-white/20 text-white'
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-[32px] border border-white/30 bg-white/10 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Snapshot</p>
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-bold">{stats.total}</p>
              <p className="text-sm text-white/70">Active roles</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{stats.remote}</p>
              <p className="text-sm text-white/70">Fully remote roles</p>
            </div>
            {stats.newest && (
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Fresh drop</p>
                <p className="text-lg font-semibold">{stats.newest}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {feedback && (
        <Card className={feedback.type === 'success' ? 'bg-emerald-50/70 text-emerald-900' : 'bg-rose-50/70 text-rose-900'}>
          <p className="text-sm font-medium">{feedback.message}</p>
        </Card>
      )}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="space-y-6">
          <CardHeader className="mb-0">
            <CardTitle>Open roles</CardTitle>
            <CardDescription>Showing {filteredJobs.length} of {jobs.length} positions</CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-3">
            {workModes.map((mode) => (
              <Button
                key={mode}
                variant={workFilter === mode ? 'default' : 'secondary'}
                size="sm"
                className="rounded-full"
                onClick={() => setWorkFilter(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-5 shadow-none border border-primary-50 bg-white">
                <CardHeader className="mb-0 gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription>{job.company} · {job.location}</CardDescription>
                    </div>
                    <Badge variant="outline">{format(new Date(job.created_at), 'MMM dd')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(job.required_skills ?? []).slice(0, 3).map((skill) => (
                      <Badge key={skill} className="bg-primary-50 text-primary-700">{skill}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-charcoal/70 line-clamp-3">
                  {job.description}
                </CardContent>
                <CardFooter className="mt-4 flex flex-wrap gap-3 text-sm text-charcoal/60">
                  <span>Track: {job.role}</span>
                  <span>Applicants ready: 150+</span>
                  <div className="ml-auto flex gap-3">
                    {isAdmin ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/applications`)}
                      >
                        View applicants
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setApplyJob(job)}>
                        Apply now
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
            {filteredJobs.length === 0 && (
              <Card className="text-center text-sm text-charcoal/70">
                No roles match your filters just yet. Try broadening your search.
              </Card>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spotlight</CardTitle>
              <CardDescription>Personalized insights from our talent team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-charcoal/80">
              <div className="rounded-2xl bg-charcoal/5 p-4">
                <p className="font-semibold text-charcoal">Curated Talents</p>
                <p className="text-charcoal/70">61 shortlisted candidates match your filters right now.</p>
              </div>
              <div className="rounded-2xl bg-primary-50 p-4">
                <p className="font-semibold text-primary-800">Workflow tip</p>
                <p className="text-primary-700">
                  Save time by sending one-click briefs to every shortlisted candidate.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview reminders</CardTitle>
              <CardDescription>Never miss a follow-up with your top picks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal/80">
              <div className="flex items-center justify-between rounded-2xl border border-primary-50 p-3">
                <div>
                  <p className="font-semibold">UI/UX Panel</p>
                  <p className="text-charcoal/60">Wed · 10:00 AM</p>
                </div>
                <Badge variant="success">Ready</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-primary-50 p-3">
                <div>
                  <p className="font-semibold">Frontend Technical</p>
                  <p className="text-charcoal/60">Thu · 2:30 PM</p>
                </div>
                <Badge>Awaiting</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {!isAdmin && applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setApplyJob(null)}>
          <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Apply for {applyJob.title}</CardTitle>
              <CardDescription>
                {applyJob.company} · {applyJob.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal">Cover Letter</label>
                <Textarea
                  className="mt-2"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-charcoal">Skills (comma separated)</label>
                  <Input
                    className="mt-2"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Motion, Strategy"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal">Certifications</label>
                  <Input
                    className="mt-2"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="AWS, PMP"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal">Resume (PDF/DOC)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-2xl border border-dashed border-primary-200 bg-white/80 px-4 py-3 text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="mt-0 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setApplyJob(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActiveJobs;


