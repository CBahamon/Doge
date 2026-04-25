import React, { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  type: string;
  rating: number;
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
          const validSeasons = data.seasons?.filter((s:any) => s.season_number > 0) || [];
          setSeasons(validSeasons);
          setSelectedSeason(validSeasons[0]?.season_number || 1);
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
    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  const playMedia = async (lang: 'spanish' | 'english', episodeNum?: number) => {
    if (!selectedMovie) return;
    const res = await fetch(`/api/stream?id=${selectedMovie.id}&type=${selectedMovie.type}&s=${selectedSeason}&e=${episodeNum || 1}`);
    const data = await res.json();
    const url = lang === 'spanish' ? data.spanish : data.english;
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="app-container">
      {view === 'home' && (
        <div className="home-screen">
          <h1 className="logo">DOGE <span>MEDIA</span></h1>
          <div className="main-options">
            <div className="opt-card" onClick={() => setView('anime')}>
              <div className="opt-icon">⛩️</div>
              <h3>ANIME</h3>
            </div>
            <div className="opt-card" onClick={() => setView('movies')}>
              <div className="opt-icon">🎬</div>
              <h3>CINE & TV</h3>
            </div>
            <div className="opt-card" onClick={() => setView('cuevana')}>
              <div className="opt-icon">💎</div>
              <h3>CUEVANA</h3>
            </div>
          </div>
        </div>
      )}

      {view !== 'home' && (
        <div className="browse-screen">
          <header className="header">
            <button className="back-btn" onClick={() => { setView('home'); setResults([]); }}>←</button>
            <form onSubmit={searchMedia} className="search-form">
              <input placeholder={`Buscar...`} value={query} onChange={e => setQuery(e.target.value)} />
            </form>
          </header>
          <div className="results-grid">
            {results.map(movie => (
              <div key={movie.id} className="movie-item" onClick={() => setSelectedMovie(movie)}>
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-info-mini"><span>⭐ {movie.rating.toFixed(1)}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-container" style={{backgroundImage: `linear-gradient(to bottom, rgba(15, 12, 41, 0.9), #0f0c29), url(${selectedMovie.backdrop})`}}>
            <div className="modal-header">
              <img src={selectedMovie.poster} className="main-poster" />
              <div className="main-details">
                <h1>{selectedMovie.title}</h1>
                <p className="description">{selectedMovie.overview}</p>
                {selectedMovie.type === 'movie' && (
                  <div className="btn-group">
                    <button className="play-btn sp" onClick={() => playMedia('spanish')}>▶ VER EN ESPAÑOL</button>
                    <button className="play-btn en" onClick={() => playMedia('english')}>▶ ORIGINAL / SUB</button>
                  </div>
                )}
              </div>
            </div>

            {selectedMovie.type === 'tv' && (
              <div className="tv-area">
                <select className="season-select" value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))}>
                  {seasons.map(s => <option key={s.id} value={s.season_number}>{s.name}</option>)}
                </select>
                <div className="episodes-scroll">
                  {episodes.map(ep => (
                    <div key={ep.episode_number} className="ep-card">
                      <div className="ep-img-container">
                        <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.poster} />
                        <div className="ep-overlay">
                          <button onClick={() => playMedia('spanish', ep.episode_number)}>ESPAÑOL</button>
                          <button onClick={() => playMedia('english', ep.episode_number)}>SUB</button>
                        </div>
                      </div>
                      <span className="ep-title">{ep.episode_number}. {ep.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button className="close-modal" onClick={() => setSelectedMovie(null)}>×</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root { --accent: #ff0055; --bg: #0f0c29; }
        .app-container { color: white; font-family: sans-serif; min-height: 100vh; background: var(--bg); }
        .home-screen { text-align: center; padding-top: 10vh; }
        .logo { font-size: 3rem; margin-bottom: 2rem; }
        .main-options { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .opt-card { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 20px; cursor: pointer; width: 200px; }
        .header { display: flex; padding: 1rem; gap: 1rem; background: var(--bg); position: sticky; top: 0; z-index: 10; }
        .search-form { flex: 1; }
        .search-form input { width: 100%; padding: 0.8rem; border-radius: 20px; border: none; background: rgba(255,255,255,0.1); color: white; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; padding: 1rem; }
        .movie-item { border-radius: 10px; overflow: hidden; cursor: pointer; position: relative; }
        .movie-item img { width: 100%; display: block; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-container { width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; background-size: cover; border-radius: 20px; padding: 2rem; position: relative; }
        .modal-header { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .main-poster { width: 180px; border-radius: 10px; }
        .main-details { flex: 1; min-width: 280px; }
        .btn-group { display: flex; gap: 1rem; margin-top: 1rem; }
        .play-btn { border: none; padding: 0.8rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold; }
        .play-btn.sp { background: var(--accent); color: white; }
        .play-btn.en { background: white; color: black; }
        .tv-area { margin-top: 1.5rem; }
        .season-select { width: 100%; padding: 0.5rem; margin-bottom: 1rem; background: #222; color: white; }
        .episodes-scroll { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; }
        .ep-card { flex: 0 0 180px; }
        .ep-img-container { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 16/9; }
        .ep-img-container img { width: 100%; height: 100%; object-fit: cover; }
        .ep-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; gap: 5px; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
        .ep-card:hover .ep-overlay { opacity: 1; }
        .ep-overlay button { padding: 4px 10px; font-size: 0.7rem; cursor: pointer; border: none; border-radius: 4px; }
        .close-modal { position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }
      `}} />
    </div>
  );
};

export default App;
