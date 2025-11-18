import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import './Profile.css';

const Profile = () => {
  const { user } = useAuthStore();

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <span className="badge capitalize">{user.role.toLowerCase()}</span>
      </div>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar-large flex items-center justify-center text-2xl font-semibold text-white bg-primary-600">
              {initials}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>@{user.username}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <div className="profile-section">
            <h3>Account</h3>
            <div className="info-item">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="info-item">
              <strong>Username:</strong> {user.username}
            </div>
            <div className="info-item">
              <strong>Member ID:</strong> {user.id}
            </div>
          </div>
          <div className="profile-section">
            <h3>Security</h3>
            <p className="text-sm text-gray-500">
              Password management and multi-factor authentication will be available soon.
            </p>
          </div>
        </div>
        <div className="reviews-card">
          <h2>Notes</h2>
          <p className="text-sm text-gray-500">
            Profile enrichment (company info, contact details and preferences) will sync automatically
            once connected to the backend endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

