import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ActiveJobs from './pages/ActiveJobs';
import PostJob from './pages/PostJob';
import MatchingCandidates from './pages/MatchingCandidates';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import Applications from './pages/Applications';
import Landing from './pages/Landing';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user, token } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={token && user ? <Navigate to="/dashboard" replace /> : <Landing />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <PrivateRoute>
            <Layout>
              <ActiveJobs />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/post"
        element={
          <PrivateRoute>
            <Layout>
              <PostJob />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/:jobId/applications"
        element={
          <PrivateRoute>
            <Layout>
              <MatchingCandidates />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <PrivateRoute>
            <Layout>
              <Applications />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

