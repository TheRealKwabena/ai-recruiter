import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import './PostJob.css';

const PostJob = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    company: '',
    location: '',
    description: '',
    requiredSkills: '',
    requiredCertifications: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isAdmin) {
    return <Navigate to="/jobs" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toList = (value: string) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/jobs', {
        title: formData.title,
        role: formData.role,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        required_skills: toList(formData.requiredSkills),
        required_certifications: toList(formData.requiredCertifications),
      });
      setSuccess('Job posted successfully. Redirecting…');
      setTimeout(() => navigate('/jobs'), 1000);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to post job';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job">
      <h1>Create a new job</h1>
      <p className="subtitle">Share role details and required skills so candidates can apply.</p>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            placeholder="Senior Frontend Engineer"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Role / Level</label>
          <input
            type="text"
            name="role"
            placeholder="Engineering · IC4"
            value={formData.role}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid-two">
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              placeholder="AI Recruiter Inc."
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Remote · San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows={6}
            placeholder="Describe responsibilities, impact, tools and expectations."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid-two">
          <div className="form-group">
            <label>Required Skills (comma separated)</label>
            <input
              type="text"
              name="requiredSkills"
              placeholder="React, TypeScript, UI testing"
              value={formData.requiredSkills}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Certifications (optional)</label>
            <input
              type="text"
              name="requiredCertifications"
              placeholder="AWS Architect, PMP"
              value={formData.requiredCertifications}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary btn-submit" disabled={loading}>
          {loading ? 'Posting…' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;

