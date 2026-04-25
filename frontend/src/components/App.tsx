import React, { useState } from 'react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'anime' | 'movies'>('home');

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {view === 'home' && (
        <div className="home-selection" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '10vh' }}>
          <div 
            className="glass-container" 
            style={{ padding: '3rem', cursor: 'pointer', textAlign: 'center', width: '250px' }}
            onClick={() => setView('anime')}
          >
            <h2 style={{ fontSize: '2.5rem' }}>⛩️</h2>
            <h3>Anime</h3>
          </div>

          <div 
            className="glass-container" 
            style={{ padding: '3rem', cursor: 'pointer', textAlign: 'center', width: '250px' }}
            onClick={() => setView('movies')}
          >
            <h2 style={{ fontSize: '2.5rem' }}>🎬</h2>
            <h3>Películas y Series</h3>
          </div>
        </div>
      )}

      {view !== 'home' && (
        <div>
          <button className="btn btn-primary" onClick={() => setView('home')}>← Volver</button>
          <header style={{ marginTop: '2rem' }}>
            <h1>{view === 'anime' ? 'Explorar Anime' : 'Explorar Películas'}</h1>
            <div className="glass-container" style={{ padding: '1rem', marginTop: '1rem' }}>
              <input 
                type="text" 
                placeholder="Buscar..." 
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1.2rem' }}
              />
            </div>
          </header>
          
          <main style={{ marginTop: '3rem' }}>
            <p>Próximamente: Integración con TMDB y Scrapers...</p>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
