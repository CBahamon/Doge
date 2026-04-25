import React, { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  type: string;
  rating: number;
  date: string;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path: string;
  overview: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'browse'>('home');
  const [category, setCategory] = useState<'anime' | 'movies' | 'cuevana'>('movies');
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
          const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];
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
    if (!query) return;
    setLoading(true);
    setView('browse');
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

  const playMedia = async (lang: 'spanish' | 'english', episodeNum?: number) => {
    if (!selectedMovie) return;
    const res = await fetch(`/api/stream?id=${selectedMovie.id}&type=${selectedMovie.type}&s=${selectedSeason}&e=${episodeNum || 1}`);
    const data = await res.json();
    const url = lang === 'spanish' ? data.spanish : data.english;
    if (url) window.open(url, '_blank');
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
      <h1 className="text-6xl md:text-8xl font-black mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
        DOGE<span className="text-white">MEDIA</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[
          { id: 'anime', label: 'ANIME', icon: '⛩️', color: 'from-purple-600 to-indigo-600' },
          { id: 'movies', label: 'CINE & TV', icon: '🎬', color: 'from-rose-600 to-pink-600' },
          { id: 'cuevana', label: 'CUEVANA', icon: '💎', color: 'from-amber-500 to-orange-500' }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setCategory(opt.id as any); setView('browse'); }}
            className={`group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br ${opt.color} shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95`}
          >
            <span className="block text-6xl mb-4 group-hover:animate-bounce">{opt.icon}</span>
            <span className="text-2xl font-bold tracking-widest text-white">{opt.label}</span>
          </button>
        ))}
      </div>
      <form onSubmit={searchMedia} className="mt-16 w-full max-w-2xl relative">
        <input
          type="text"
          placeholder="Busca tu próxima aventura..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-6 pl-8 rounded-full bg-white/10 border border-white/20 text-white text-xl backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-rose-500/50 transition-all placeholder:text-white/40"
        />
        <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 rounded-full bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors">
          BUSCAR
        </button>
      </form>
    </div>
  );

  const renderBrowse = () => (
    <div className="p-4 md:p-8 animate-in slide-in-from-bottom duration-500">
      <header className="flex flex-col md:flex-row items-center gap-6 mb-12">
        <button 
          onClick={() => { setView('home'); setResults([]); setQuery(''); }}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
        >
          ← VOLVER
        </button>
        <form onSubmit={searchMedia} className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Buscar más..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 px-8 rounded-full bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-500 transition-all"
          />
        </form>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-rose-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.map((movie) => (
            <div 
              key={movie.id} 
              onClick={() => setSelectedMovie(movie)}
              className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]"
            >
              <img src={movie.poster} className="w-full aspect-[2/3] object-cover" alt={movie.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h4 className="font-bold text-white leading-tight">{movie.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-rose-500 bg-rose-500/20 px-2 py-0.5 rounded">⭐ {movie.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-300">{movie.date?.split('-')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 selection:bg-rose-500">
      {view === 'home' ? renderHome() : renderBrowse()}

      {selectedMovie && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
          onClick={() => setSelectedMovie(null)}
        >
          <div 
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#121214] border border-white/10 shadow-2xl flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full md:w-[400px] flex-shrink-0 relative overflow-hidden group">
              <img src={selectedMovie.poster} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent"></div>
            </div>

            <div className="flex-1 p-8 md:p-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                    <span className="text-rose-500">⭐ {selectedMovie.rating.toFixed(1)}</span>
                    <span>{selectedMovie.date}</span>
                    <span className="border border-white/20 px-2 rounded uppercase">{selectedMovie.type}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedMovie(null)} className="text-4xl opacity-50 hover:opacity-100 transition-opacity">×</button>
              </div>

              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">{selectedMovie.overview || "Sin descripción disponible."}</p>

              {selectedMovie.type === 'movie' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => playMedia('spanish')} className="group flex items-center justify-center gap-3 p-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🇪🇸</span> VER EN ESPAÑOL
                  </button>
                  <button onClick={() => playMedia('english')} className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black border border-white/10 transition-all">
                    <span>🌐</span> ORIGINAL / SUB
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="font-bold opacity-60">TEMPORADA:</span>
                    <select 
                      value={selectedSeason} 
                      onChange={e => setSelectedSeason(Number(e.target.value))}
                      className="bg-transparent font-black text-xl text-rose-500 focus:outline-none"
                    >
                      {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#121214]">{s.name}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {episodes.map(ep => (
                      <div 
                        key={ep.episode_number} 
                        className="flex-shrink-0 w-64 group cursor-pointer"
                        onClick={() => playMedia('spanish', ep.episode_number)}
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                          <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.backdrop} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-rose-500/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-4xl">▶</div>
                        </div>
                        <h5 className="font-bold text-sm truncate group-hover:text-rose-500 transition-colors">{ep.episode_number}. {ep.name}</h5>
                        <div className="flex gap-2 mt-2">
                           <button onClick={(e) => { e.stopPropagation(); playMedia('spanish', ep.episode_number); }} className="text-[10px] bg-rose-500 px-2 py-0.5 rounded font-bold">ESP</button>
                           <button onClick={(e) => { e.stopPropagation(); playMedia('english', ep.episode_number); }} className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-bold">SUB</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
