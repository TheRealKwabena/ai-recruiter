import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import './Settings.css';

const Settings = () => {
  const { user } = useAuthStore();
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
  });
  const [message, setMessage] = useState('');

  const togglePreference = (key: 'email' | 'sms') => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setMessage('Preferences saved locally. API sync coming soon.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      {message && <div className="message success">{message}</div>}

      <div className="settings-section">
        <div className="section-header">
          <h2>Account</h2>
        </div>
        <div className="info-row">
          <span>Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="info-row">
          <span>Username</span>
          <span>@{user?.username}</span>
        </div>
        <div className="info-row">
          <span>Role</span>
          <span className="capitalize">{user?.role.toLowerCase()}</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>Notifications</h2>
          <button className="btn-secondary" onClick={handleSave}>
            Save
          </button>
        </div>
        <div className="notification-item">
          <label>Email updates</label>
          <div
            className={`toggle ${preferences.email ? 'on' : 'off'}`}
            onClick={() => togglePreference('email')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
        <div className="notification-item">
          <label>SMS alerts</label>
          <div
            className={`toggle ${preferences.sms ? 'on' : 'off'}`}
            onClick={() => togglePreference('sms')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Security</h2>
        <p className="text-sm text-gray-500">
          Password resets and MFA configuration will be exposed once the backend endpoints are ready.
        </p>
      </div>
    </div>
  );
};

export default Settings;

