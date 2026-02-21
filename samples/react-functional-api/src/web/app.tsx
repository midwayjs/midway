import { useEffect, useState } from 'react';
import { api } from './api/client';

type User = {
  id: string;
  name: string;
};

export function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, lineHeight: 1.5 }}>
      <h1>Midway Functional API + React Sample</h1>
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
  const [manifestMessage, setManifestMessage] = useState<string>('Not loaded');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);

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

  const loadFromManifest = async () => {
    setManifestError(null);
    if (!import.meta.env.DEV) {
      setManifestMessage('Only enabled in dev');
      return;
    }
    try {
      const data = (await api.call<{
        name?: string;
        id?: string;
      }>('getUser', {
        params: {
          id: 'u-1',
        },
      })) as {
        name?: string;
        id?: string;
      };
      setManifestMessage(
        data?.name && data?.id ? `${data.name} (${data.id})` : 'No data'
      );
    } catch (err: any) {
      setManifestError(err?.message || String(err));
    }
  };

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
      <div style={{ marginTop: 16 }}>
        <button onClick={loadFromManifest}>Load Route Via Manifest</button>
        <div style={{ marginTop: 8 }}>
          <strong>Manifest Route:</strong> {manifestMessage}
        </div>
        {manifestError && (
          <div style={{ marginTop: 8, color: 'crimson' }}>
            <strong>Manifest Call Error:</strong> {manifestError}
          </div>
        )}
      </div>
      <p style={{ marginTop: 12, color: '#666' }}>
        If backend routes are not running yet, you should still see this page
        with an error message instead of a blank screen.
      </p>
    </section>
  );
}
