import React, { useState } from 'react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  date: string;
  type: string;
  rating: number;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'anime' | 'movies' | 'cuevana'>('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const searchMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}&type=${view}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playMovie = async (movie: Movie) => {
    const sourceMap = { anime: 'ani-cli', movies: 'mov-cli', cuevana: 'cuevana' };
    const source = sourceMap[view as keyof typeof sourceMap];
    
    try {
      const response = await fetch(`http://localhost:3000/api/stream?title=${encodeURIComponent(movie.title)}&type=${movie.type}&source=${source}`);
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      alert("Error al obtener el link");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {view === 'home' && (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '3rem', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>Doge Media Center</h1>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="glass-container card-hover" onClick={() => setView('anime')} style={{ padding: '3rem', width: '280px', cursor: 'pointer' }}>
              <span style={{ fontSize: '4rem' }}>⛩️</span>
              <h2>Anime</h2>
              <p>(ani-cli)</p>
            </div>
            <div className="glass-container card-hover" onClick={() => setView('movies')} style={{ padding: '3rem', width: '280px', cursor: 'pointer' }}>
              <span style={{ fontSize: '4rem' }}>🎬</span>
              <h2>Cine y TV</h2>
              <p>(mov-cli)</p>
            </div>
            <div className="glass-container card-hover" onClick={() => setView('cuevana')} style={{ padding: '3rem', width: '280px', cursor: 'pointer' }}>
              <span style={{ fontSize: '4rem' }}>💎</span>
              <h2>Cuevana</h2>
              <p>(Scraper)</p>
            </div>
          </div>
        </div>
      )}

      {view !== 'home' && (
        <div>
          <header style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
            <button className="btn btn-primary" onClick={() => { setView('home'); setResults([]); setQuery(''); }}>← Menú</button>
            <form onSubmit={searchMedia} style={{ flex: 1 }}>
              <div className="glass-container" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar en ${view.toUpperCase()}...`} 
                  style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1.2rem', padding: '10px' }}
                />
                <button type="submit" className="btn btn-primary">Buscar</button>
              </div>
            </form>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
            {results.map((item) => (
              <div key={item.id} className="glass-container movie-card" onClick={() => setSelectedMovie(item)}>
                <img src={item.poster} style={{ width: '100%', borderRadius: '15px' }} />
                <div style={{ padding: '10px' }}>
                  <h4 style={{ margin: '5px 0' }}>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <img src={selectedMovie.poster} style={{ width: '300px', borderRadius: '20px' }} />
              <div style={{ flex: 1 }}>
                <h1>{selectedMovie.title}</h1>
                <p>{selectedMovie.overview}</p>
                <button className="btn btn-primary" style={{ marginTop: '20px', padding: '15px 40px' }} onClick={() => playMovie(selectedMovie)}>
                  ▶️ Reproducir con {view === 'anime' ? 'ani-cli' : view === 'movies' ? 'mov-cli' : 'Cuevana'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .card-hover:hover { transform: translateY(-10px); border-color: var(--accent-color); background: rgba(255,255,255,0.1); }
        .movie-card:hover { transform: scale(1.05); }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { max-width: 900px; padding: 3rem; position: relative; }
      `}} />
    </div>
  );
};

export default App;
