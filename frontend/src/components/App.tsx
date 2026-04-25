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
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md p-4 md:px-12 flex items-center justify-between border-b border-white/5">
        <h1 onClick={() => { setView('home'); setQuery(''); }} className="text-2xl md:text-3xl font-black tracking-tighter text-rose-500 cursor-pointer">
          DOGE<span className="text-white">MEDIA</span>
        </h1>
        <form onSubmit={searchMedia} className="relative w-full max-w-md ml-4">
          <input 
            type="text" 
            placeholder="Películas, series, anime..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
          />
        </form>
      </nav>

      <main className="pt-28 pb-12 px-4 md:px-12">
        <section className="animate-in fade-in duration-700">
          <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
            {view === 'home' ? 'Tendencias de la Semana' : `Resultados para "${query}"`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-8">
              {(view === 'home' ? trending : results).map(movie => (
                <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer transition-all duration-300 hover:scale-105">
                  <div className="relative aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-[#121214]">
                    <img src={movie.poster} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-xs">DETALLES</span>
                    </div>
                  </div>
                  <h4 className="mt-3 font-bold text-xs md:text-sm truncate group-hover:text-rose-500 transition-colors">{movie.title}</h4>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL REDISEÑADO: SCROLL VERTICAL Y PARRILLA DE EPISODIOS */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto" onClick={() => setSelectedMovie(null)}>
          <div 
            className="relative w-full max-w-6xl min-h-screen md:min-h-0 md:rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 shadow-2xl flex flex-col overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* HERO DEL MODAL */}
            <div className="relative w-full h-[300px] md:h-[450px] flex-shrink-0">
              <img src={selectedMovie.backdrop} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex flex-col md:flex-row items-end gap-6">
                <img src={selectedMovie.poster} className="hidden md:block w-48 rounded-2xl shadow-2xl border border-white/10" />
                <div className="flex-1">
                  <h2 className="text-3xl md:text-6xl font-black mb-4 leading-tight drop-shadow-2xl">{selectedMovie.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <span className="text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">⭐ {selectedMovie.rating.toFixed(1)}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{selectedMovie.date}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{selectedMovie.type}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 text-4xl opacity-50 hover:opacity-100 z-10">×</button>
            </div>

            {/* CONTENIDO DEL MODAL */}
            <div className="p-6 md:p-12 space-y-12">
              <p className="text-gray-400 leading-relaxed max-w-3xl text-lg md:text-xl">
                {selectedMovie.overview || "Sin descripción disponible."}
              </p>
              
              {selectedMovie.type === 'movie' ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => playMedia('spanish')} className="flex-1 px-8 py-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all flex items-center justify-center gap-3 text-lg">
                    <span>🇪🇸</span> VER EN ESPAÑOL (LATINO)
                  </button>
                  <button onClick={() => playMedia('english')} className="flex-1 px-8 py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black transition-all flex items-center justify-center gap-3 text-lg border border-white/10">
                    <span>🌐</span> ORIGINAL / SUB
                  </button>
                </div>
              ) : (
                <div className="space-y-8 pb-12">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black">TEMPORADAS</h3>
                    <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-bold text-rose-500 focus:outline-none">
                      {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0c]">{s.name}</option>)}
                    </select>
                  </div>

                  {/* PARRILLA DE EPISODIOS - TV FRIENDLY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {episodes.map(ep => (
                      <div key={ep.episode_number} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:bg-rose-500/20 hover:border-rose-500/50">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.backdrop} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                             <div className="flex gap-2">
                               <button onClick={() => playMedia('spanish', ep.episode_number)} className="bg-rose-500 px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-xl">Español</button>
                               <button onClick={() => playMedia('english', ep.episode_number)} className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-xl">Original</button>
                             </div>
                          </div>
                          <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-black">EP {ep.episode_number}</span>
                        </div>
                        <div className="p-4">
                          <h5 className="font-bold text-sm group-hover:text-rose-500 transition-colors">{ep.name}</h5>
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
