import React, { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  type: string;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path: string;
  overview: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'anime' | 'movies' | 'cuevana'>('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Estados para Series
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Al seleccionar una serie, cargar sus temporadas
  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv') {
      fetch(`/api/tv/${selectedMovie.id}`)
        .then(res => res.json())
        .then(data => {
          setSeasons(data.seasons || []);
          setSelectedSeason(data.seasons[0]?.season_number || 1);
        });
    }
  }, [selectedMovie]);

  // Al cambiar de temporada, cargar sus episodios
  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv') {
      fetch(`/api/tv/${selectedMovie.id}/season/${selectedSeason}`)
        .then(res => res.json())
        .then(data => setEpisodes(data.episodes || []));
    }
  }, [selectedSeason, selectedMovie]);

  const searchMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/search?query=${query}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  const playMedia = async (episodeNum?: number) => {
    const source = view === 'anime' ? 'ani-cli' : 'mov-cli';
    const s = selectedSeason;
    const e = episodeNum || 1;
    
    const res = await fetch(`/api/stream?title=${selectedMovie?.title}&source=${source}&s=${s}&e=${e}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {view === 'home' && (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '3rem' }}>Doge Media</h1>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div className="glass-container card-hover" onClick={() => setView('anime')} style={{ padding: '3rem', cursor: 'pointer' }}>⛩️ Anime</div>
            <div className="glass-container card-hover" onClick={() => setView('movies')} style={{ padding: '3rem', cursor: 'pointer' }}>🎬 Cine y TV</div>
          </div>
        </div>
      )}

      {view !== 'home' && (
        <div>
          <button className="btn btn-primary" onClick={() => setView('home')}>← Volver</button>
          <form onSubmit={searchMedia} style={{ margin: '2rem 0' }}>
            <input 
              className="glass-container" 
              style={{ width: '100%', padding: '1rem', border: 'none', color: 'white', outline: 'none' }}
              placeholder="Buscar..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
            {results.map(movie => (
              <div key={movie.id} className="glass-container movie-card" onClick={() => setSelectedMovie(movie)}>
                <img src={movie.poster} style={{ width: '100%', borderRadius: '15px' }} />
                <h4 style={{ padding: '10px' }}>{movie.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => { setSelectedMovie(null); setEpisodes([]); }}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <img src={selectedMovie.poster} style={{ width: '200px', borderRadius: '15px' }} />
              <div>
                <h1>{selectedMovie.title}</h1>
                <p>{selectedMovie.overview}</p>
                {selectedMovie.type === 'movie' && (
                  <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => playMedia()}>▶️ Reproducir Película</button>
                )}
              </div>
            </div>

            {selectedMovie.type === 'tv' && (
              <div className="episodes-section">
                <h3>Temporadas</h3>
                <select 
                  className="glass-container" 
                  style={{ background: '#222', color: 'white', padding: '10px', width: '100%', marginBottom: '2rem' }}
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(Number(e.target.value))}
                >
                  {seasons.map(s => (
                    <option key={s.id} value={s.season_number}>{s.name}</option>
                  ))}
                </select>

                <h3>Episodios</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {episodes.map(ep => (
                    <div key={ep.episode_number} className="glass-container" style={{ display: 'flex', gap: '1rem', padding: '10px', alignItems: 'center', cursor: 'pointer' }} onClick={() => playMedia(ep.episode_number)}>
                      <div style={{ width: '150px', height: '85px', background: '#333', borderRadius: '10px', flexShrink: 0, overflow: 'hidden' }}>
                        {ep.still_path && <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} style={{ width: '100%' }} />}
                      </div>
                      <div>
                        <strong>{ep.episode_number}. {ep.name}</strong>
                        <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '5px 0' }}>{ep.overview.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .card-hover:hover { border-color: var(--accent-color); transform: translateY(-5px); }
        .movie-card:hover { transform: scale(1.05); cursor: pointer; }
        .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-content { max-width: 800px; width:90%; padding: 2rem; }
      `}} />
    </div>
  );
};

export default App;
