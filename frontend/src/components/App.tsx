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
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv') {
      fetch(`/api/tv/${selectedMovie.id}`)
        .then(res => res.json())
        .then(data => {
          setSeasons(data.seasons || []);
          const firstSeason = data.seasons?.find((s:any) => s.season_number > 0) || data.seasons?.[0];
          setSelectedSeason(firstSeason?.season_number || 1);
        });
    }
  }, [selectedMovie]);

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
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playMedia = async (episodeNum?: number) => {
    const sourceMap = { anime: 'ani-cli', movies: 'mov-cli', cuevana: 'cuevana' };
    const source = sourceMap[view as keyof typeof sourceMap] || 'mov-cli';
    const s = selectedSeason;
    const e = episodeNum || 1;
    
    try {
      const res = await fetch(`/api/stream?title=${encodeURIComponent(selectedMovie?.title || '')}&source=${source}&s=${s}&e=${e}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      alert("Error al obtener video");
    }
  };

  return (
    <div className="container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {view === 'home' && (
        <div style={{ textAlign: 'center', marginTop: '5vh' }}>
          <h1 className="main-title">Doge Media</h1>
          <div className="home-grid">
            <div className="glass-container card-hover option-card" onClick={() => setView('anime')}>
              <span className="icon">⛩️</span>
              <h2>Anime</h2>
            </div>
            <div className="glass-container card-hover option-card" onClick={() => setView('movies')}>
              <span className="icon">🎬</span>
              <h2>Cine y TV</h2>
            </div>
            <div className="glass-container card-hover option-card" onClick={() => setView('cuevana')}>
              <span className="icon">💎</span>
              <h2>Cuevana</h2>
            </div>
          </div>
        </div>
      )}

      {view !== 'home' && (
        <div>
          <header className="view-header">
            <button className="btn btn-primary" onClick={() => { setView('home'); setResults([]); setQuery(''); }}>← Volver</button>
            <form onSubmit={searchMedia} style={{ flex: 1 }}>
              <input 
                className="glass-container search-input" 
                placeholder={`Buscar en ${view}...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </form>
          </header>

          <div className="movie-grid">
            {results.map(movie => (
              <div key={movie.id} className="glass-container movie-card" onClick={() => setSelectedMovie(movie)}>
                <img src={movie.poster} alt={movie.title} />
                <h4 className="movie-title">{movie.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => { setSelectedMovie(null); setEpisodes([]); }}>
          <div className="glass-container modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <img src={selectedMovie.poster} className="modal-poster" alt={selectedMovie.title} />
              <div className="modal-info">
                <h1>{selectedMovie.title}</h1>
                <p className="overview">{selectedMovie.overview}</p>
                {selectedMovie.type === 'movie' && (
                  <button className="btn btn-primary play-btn" onClick={() => playMedia()}>▶️ Reproducir Película</button>
                )}
              </div>
            </div>

            {selectedMovie.type === 'tv' && (
              <div className="episodes-area">
                <label>Temporada:</label>
                <select className="glass-container select-season" value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))}>
                  {seasons.filter(s => s.season_number > 0).map(s => (
                    <option key={s.id} value={s.season_number}>{s.name}</option>
                  ))}
                </select>

                <div className="episode-list">
                  {episodes.map(ep => (
                    <div key={ep.episode_number} className="glass-container episode-item" onClick={() => playMedia(ep.episode_number)}>
                      <div className="ep-thumb">
                        {ep.still_path ? <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} /> : <div className="no-img" />}
                      </div>
                      <div className="ep-info">
                        <strong>{ep.episode_number}. {ep.name}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button className="close-x" onClick={() => setSelectedMovie(null)}>×</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root { --accent: #e91e63; }
        .main-title { font-size: clamp(2rem, 8vw, 4rem); margin-bottom: 2rem; }
        .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .option-card { padding: 2rem; cursor: pointer; transition: 0.3s; }
        .icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
        
        .view-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .search-input { width: 100%; padding: 0.8rem; border: none; color: white; }
        
        .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1.5rem; }
        .movie-card { cursor: pointer; transition: 0.3s; overflow: hidden; }
        .movie-card img { width: 100%; height: auto; display: block; }
        .movie-title { padding: 0.5rem; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:2000; padding: 1rem; }
        .modal-content { max-width: 900px; width:100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative; }
        .modal-header { display: flex; gap: 2rem; flex-wrap: wrap; }
        .modal-poster { width: clamp(150px, 30vw, 250px); border-radius: 10px; }
        .modal-info { flex: 1; min-width: 250px; }
        .overview { color: #ccc; line-height: 1.4; margin: 1rem 0; font-size: 0.9rem; }
        .play-btn { width: 100%; padding: 1rem; font-size: 1.1rem; }
        
        .select-season { width: 100%; margin: 1rem 0; padding: 0.5rem; background: #111; color: white; }
        .episode-list { display: flex; flexDirection: column; gap: 0.5rem; margin-top: 1rem; }
        .episode-item { display: flex; gap: 1rem; padding: 0.5rem; align-items: center; cursor: pointer; }
        .ep-thumb { width: 100px; height: 56px; background: #333; flex-shrink: 0; border-radius: 5px; overflow: hidden; }
        .ep-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .close-x { position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }
        
        @media (max-width: 600px) {
          .modal-content { padding: 1rem; }
          .modal-header { gap: 1rem; }
          .movie-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.8rem; }
        }
      `}} />
    </div>
  );
};

export default App;
