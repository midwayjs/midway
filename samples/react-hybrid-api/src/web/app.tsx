import { useEffect, useState } from 'react';
import { api } from './api/client';

type User = {
  id: string;
  name: string;
};

export function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, lineHeight: 1.5 }}>
      <h1>React Hybrid API Sample</h1>
      <p>
        This sample mixes <code>defineApi</code> and <code>@Controller</code> in
        one Midway app.
      </p>
      <HybridPage />
    </main>
  );
}

function HybridPage() {
  const [user, setUser] = useState<User | null>(null);
  const [controllerRouteMessage, setControllerRouteMessage] =
    useState<string>('Not loaded');
  const [error, setError] = useState<string | null>(null);

  const loadFunctional = () => {
    setError(null);
    api.user
      .getUser({
        params: { id: 'u-1' },
      })
      .then(data => setUser(data as User))
      .catch(err => setError(err?.message || String(err)));
  };

  const loadDecorator = () => {
    if (!import.meta.env.DEV) {
      setControllerRouteMessage('Only available in dev');
      return;
    }
    setError(null);
    api
      .call<{ message?: string }>('controllerRouteHello', {})
      .then(data => setControllerRouteMessage(data?.message || 'No message'))
      .catch(err => setError(err?.message || String(err)));
  };

  useEffect(() => {
    loadFunctional();
    if (import.meta.env.DEV) {
      loadDecorator();
    }
  }, []);

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={loadFunctional}>Load defineApi Route</button>
        <button
          style={{ marginLeft: 8 }}
          onClick={loadDecorator}
          disabled={!import.meta.env.DEV}
        >
          Load Controller Route
        </button>
      </div>

      <div>
        <strong>defineApi:</strong>{' '}
        {user ? `${user.name} (${user.id})` : 'No user loaded'}
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>@Controller:</strong> {controllerRouteMessage}
      </div>
      {error && (
        <div style={{ marginTop: 8, color: 'crimson' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <p style={{ marginTop: 12, color: '#666' }}>
        Controller route call uses <code>api.call('controllerRouteHello')</code>{' '}
        from manifest runtime.
      </p>
    </section>
  );
}
