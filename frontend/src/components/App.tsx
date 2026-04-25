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

  const playMedia = async (episodeNum?: number) => {
    const sourceMap = { anime: 'ani-cli', movies: 'mov-cli', cuevana: 'cuevana' };
    const source = sourceMap[view as keyof typeof sourceMap] || 'mov-cli';
    const res = await fetch(`/api/stream?title=${encodeURIComponent(selectedMovie?.title || '')}&source=${source}&s=${selectedSeason}&e=${episodeNum || 1}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
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
              <input 
                placeholder={`Buscar en ${view}...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </form>
          </header>

          <div className="results-grid">
            {results.map(movie => (
              <div key={movie.id} className="movie-item" onClick={() => setSelectedMovie(movie)}>
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-info-mini">
                  <span className="rating">⭐ {movie.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 12, 41, 0.8), #0f0c29), url(${selectedMovie.backdrop})`
          }}>
            <div className="modal-header">
              <img src={selectedMovie.poster} className="main-poster" />
              <div className="main-details">
                <h1>{selectedMovie.title}</h1>
                <p className="description">{selectedMovie.overview}</p>
                {selectedMovie.type === 'movie' && (
                  <button className="play-main-btn" onClick={() => playMedia()}>▶ REPRODUCIR AHORA</button>
                )}
              </div>
            </div>

            {selectedMovie.type === 'tv' && (
              <div className="tv-area">
                <div className="season-picker">
                  <span>Temporada</span>
                  <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))}>
                    {seasons.map(s => <option key={s.id} value={s.season_number}>{s.name}</option>)}
                  </select>
                </div>

                <div className="episodes-scroll">
                  {episodes.map(ep => (
                    <div key={ep.episode_number} className="ep-card" onClick={() => playMedia(ep.episode_number)}>
                      <div className="ep-img-container">
                        <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.poster} />
                        <div className="ep-play-overlay">▶</div>
                      </div>
                      <div className="ep-meta">
                        <span className="ep-num">{ep.episode_number}</span>
                        <span className="ep-title">{ep.name}</span>
                      </div>
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
        :root { --accent: #ff0055; --bg: #0f0c29; --glass: rgba(255, 255, 255, 0.08); }
        .app-container { color: white; font-family: 'Inter', sans-serif; min-height: 100vh; background: var(--bg); }
        
        /* HOME */
        .home-screen { text-align: center; padding-top: 10vh; }
        .logo { font-size: 3.5rem; letter-spacing: 5px; margin-bottom: 3rem; }
        .logo span { color: var(--accent); }
        .main-options { display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; padding: 1rem; }
        .opt-card { background: var(--glass); padding: 2.5rem; border-radius: 25px; cursor: pointer; transition: 0.3s; width: 220px; border: 1px solid rgba(255,255,255,0.1); }
        .opt-card:hover { transform: translateY(-10px); border-color: var(--accent); background: rgba(255,0,85,0.1); }
        .opt-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        
        /* BROWSE */
        .header { display: flex; padding: 1.5rem; gap: 1rem; position: sticky; top: 0; background: var(--bg); z-index: 100; }
        .search-form { flex: 1; }
        .search-form input { width: 100%; padding: 0.8rem 1.5rem; border-radius: 50px; border: none; background: var(--glass); color: white; outline: none; border: 1px solid transparent; transition: 0.3s; }
        .search-form input:focus { border-color: var(--accent); }
        .back-btn { background: var(--glass); border: none; color: white; padding: 0.5rem 1.2rem; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
        
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; padding: 1rem; }
        .movie-item { position: relative; border-radius: 12px; overflow: hidden; cursor: pointer; transition: 0.3s; }
        .movie-item:hover { transform: scale(1.05); z-index: 10; }
        .movie-item img { width: 100%; display: block; }
        .movie-info-mini { position: absolute; bottom: 0; width: 100%; padding: 0.5rem; background: linear-gradient(transparent, black); font-size: 0.8rem; }
        
        /* MODAL */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-container { width: 95%; max-width: 1000px; max-height: 90vh; background-size: cover; background-position: center; border-radius: 30px; position: relative; overflow-y: auto; padding: 2.5rem; border: 1px solid rgba(255,255,255,0.1); }
        .modal-header { display: flex; gap: 2rem; flex-wrap: wrap; }
        .main-poster { width: 220px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .main-details { flex: 1; min-width: 300px; }
        .description { color: #ccc; line-height: 1.6; margin: 1.5rem 0; font-size: 0.95rem; }
        .play-main-btn { background: var(--accent); color: white; border: none; padding: 1rem 2.5rem; border-radius: 50px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        
        /* EPISODES SCROLL */
        .tv-area { margin-top: 2rem; }
        .season-picker { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .season-picker select { background: var(--glass); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 10px; outline: none; }
        
        .episodes-scroll { display: flex; gap: 1.2rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: thin; }
        .ep-card { flex: 0 0 200px; cursor: pointer; transition: 0.3s; }
        .ep-card:hover { transform: translateY(-5px); }
        .ep-img-container { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; margin-bottom: 0.8rem; }
        .ep-img-container img { width: 100%; height: 100%; object-fit: cover; }
        .ep-play-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(255,0,85,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; font-size: 2rem; }
        .ep-card:hover .ep-play-overlay { opacity: 1; }
        .ep-meta { display: flex; gap: 0.5rem; align-items: baseline; }
        .ep-num { font-weight: 800; color: var(--accent); }
        .ep-title { font-size: 0.85rem; color: #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .close-modal { position: absolute; top: 20px; right: 25px; background: none; border: none; color: white; font-size: 2.5rem; cursor: pointer; }
        
        @media (max-width: 600px) {
          .modal-container { padding: 1.5rem; }
          .main-poster { width: 140px; }
          .logo { font-size: 2.5rem; }
          .opt-card { width: 100%; padding: 1.5rem; }
        }
      `}} />
    </div>
  );
};

export default App;
