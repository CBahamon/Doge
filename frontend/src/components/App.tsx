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
  const [view, setView] = useState<'home' | 'search'>('home');
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Cargar tendencias al iniciar
  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => setTrending(data.results || []));
  }, []);

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
    if (!query) return;
    setLoading(true);
    setView('search');
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
    <div className="min-h-screen bg-[#070708] text-slate-100 font-sans selection:bg-rose-500">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm p-4 md:px-12 flex items-center justify-between">
        <h1 
          onClick={() => { setView('home'); setQuery(''); }} 
          className="text-3xl font-black tracking-tighter text-rose-500 cursor-pointer hover:scale-105 transition-transform"
        >
          DOGE<span className="text-white">MEDIA</span>
        </h1>
        <form onSubmit={searchMedia} className="relative w-full max-w-md ml-4">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
          />
        </form>
      </nav>

      <main className="pt-24 pb-12 px-4 md:px-12">
        {view === 'home' && (
          <section className="animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-8 bg-rose-500 rounded-full"></span>
              Tendencias de la Semana
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {trending.map(movie => (
                <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer transition-all duration-300 hover:scale-105">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                    <img src={movie.poster} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-rose-500 p-3 rounded-full text-white text-2xl">▶</span>
                    </div>
                  </div>
                  <h4 className="mt-3 font-bold text-sm truncate">{movie.title}</h4>
                  <p className="text-xs text-gray-500">{movie.date?.split('-')[0]} • ⭐ {movie.rating.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'search' && (
          <section className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">Resultados para: <span className="text-rose-500">"{query}"</span></h2>
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {results.map(movie => (
                  <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer transition-all duration-300 hover:scale-105">
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl">
                      <img src={movie.poster} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="mt-3 font-bold text-sm truncate">{movie.title}</h4>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL PREMIUM */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in zoom-in duration-300" onClick={() => setSelectedMovie(null)}>
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#121214] border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full md:w-80 flex-shrink-0">
              <img src={selectedMovie.poster} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-8 md:p-12" style={{backgroundImage: `linear-gradient(to right, #121214 20%, transparent), url(${selectedMovie.backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{selectedMovie.title}</h2>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-60">
                      <span className="text-rose-500">⭐ {selectedMovie.rating.toFixed(1)}</span>
                      <span>{selectedMovie.date}</span>
                      <span className="border border-white/20 px-2 py-0.5 rounded">{selectedMovie.type}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMovie(null)} className="text-4xl opacity-50 hover:opacity-100 transition-opacity">×</button>
                </div>
                <p className="text-gray-300 leading-relaxed mb-8 max-w-xl text-lg">{selectedMovie.overview || "Sin descripción disponible."}</p>
                
                {selectedMovie.type === 'movie' ? (
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => playMedia('spanish')} className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all flex items-center gap-3">
                      <span className="text-2xl">🇪🇸</span> VER EN ESPAÑOL / LATINO
                    </button>
                    <button onClick={() => playMedia('english')} className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black transition-all flex items-center gap-3">
                      <span>🌐</span> ORIGINAL / SUB
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-4 p-2 px-6 rounded-full bg-white/5 border border-white/10">
                      <span className="text-sm font-bold opacity-60">TEMPORADA:</span>
                      <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} className="bg-transparent font-black text-rose-500 focus:outline-none">
                        {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#121214]">{s.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {episodes.map(ep => (
                        <div key={ep.episode_number} className="flex-shrink-0 w-60 group">
                          <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                            <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.backdrop} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                               <button onClick={() => playMedia('spanish', ep.episode_number)} className="bg-rose-500 px-4 py-1 rounded-full text-[10px] font-black uppercase">Español</button>
                               <button onClick={() => playMedia('english', ep.episode_number)} className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase">Sub</button>
                            </div>
                          </div>
                          <h5 className="font-bold text-xs truncate">{ep.episode_number}. {ep.name}</h5>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
