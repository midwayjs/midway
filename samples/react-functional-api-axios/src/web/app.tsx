import { useEffect, useState } from 'react';
import { api } from './api/client';

type User = {
  id: string;
  name: string;
};

export function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, lineHeight: 1.5 }}>
      <h1>Midway Functional API + React Axios Sample</h1>
      <p>
        This page imports API definitions from <code>src/server/api</code> and
        calls them with <code>createClient</code>.
      </p>
      <UserPage />
    </main>
  );
}

function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = () => {
    setLoading(true);
    setError(null);
    api.user
      .getUser({
        params: { id: 'u-1' },
      })
      .then(data => setUser(data as User))
      .catch(err => {
        setError(err?.message || String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={loadUser} disabled={loading}>
          {loading ? 'Loading...' : 'Reload User'}
        </button>
      </div>
      <div>
        <strong>Current User:</strong>{' '}
        {user ? `${user.name} (${user.id})` : 'No user loaded'}
      </div>
      {error && (
        <div style={{ marginTop: 8, color: 'crimson' }}>
          <strong>Request Error:</strong> {error}
        </div>
      )}
      <p style={{ marginTop: 12, color: '#666' }}>
        If backend routes are not running yet, you should still see this page
        with an error message instead of a blank screen.
      </p>
    </section>
  );
}
