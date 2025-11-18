import { useEffect, useState } from 'react';
import api from '../api/axios';
import './Network.css';

interface Connection {
  id: string;
  connection: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    industry?: string;
  };
}

interface SuggestedUser {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  industry?: string;
}

const MyNetwork = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [connectionsRes, suggestedRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/suggested'),
      ]);
      setConnections(connectionsRes.data);
      setSuggested(suggestedRes.data);
    } catch (error) {
      console.error('Failed to fetch network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await api.post(`/connections/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="network-page">
      <div className="network-layout">
        <div className="connections-section">
          <div className="section-header">
            <h2>My Connections</h2>
            <span className="badge">{connections.length}</span>
          </div>
          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />
          <div className="connections-list">
            {connections.map((conn) => (
              <div key={conn.id} className="connection-item">
                <div className="connection-avatar"></div>
                <div className="connection-info">
                  <div className="connection-name">
                    {conn.connection.firstName} {conn.connection.lastName}
                  </div>
                  <div className="connection-role">
                    UI/UX Designer @{conn.connection.companyName || 'company'}
                  </div>
                </div>
                <button className="icon-btn">✉️</button>
              </div>
            ))}
          </div>
        </div>
        <div className="suggested-section">
          <div className="section-header">
            <h2>People around you</h2>
            <a href="#" className="show-all">Show All</a>
          </div>
          <div className="suggested-grid">
            {suggested.slice(0, 6).map((user) => (
              <div key={user.id} className="suggested-card">
                <div className="suggested-avatar"></div>
                <div className="suggested-name">
                  {user.firstName} {user.lastName}
                </div>
                <div className="suggested-role">
                  UI/UX Designer @{user.companyName || 'company name'}
                </div>
                <button
                  className="btn-connect"
                  onClick={() => handleConnect(user.id)}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNetwork;

