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
}

interface Provider {
  name: string;
  lang: string;
  url: string;
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
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/trending').then(res => res.json()).then(data => setTrending(data.results || []));
  }, []);

  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv') {
      fetch(`/api/tv/${selectedMovie.id}`).then(res => res.json()).then(data => {
        const valid = data.seasons?.filter((s:any) => s.season_number > 0) || [];
        setSeasons(valid);
        setSelectedSeason(valid[0]?.season_number || 1);
      });
    }
    if (selectedMovie && selectedMovie.type === 'movie') {
      fetch(`/api/stream?id=${selectedMovie.id}&type=movie`).then(res => res.json()).then(data => setProviders(data.providers));
    }
  }, [selectedMovie]);

  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv') {
      fetch(`/api/tv/${selectedMovie.id}/season/${selectedSeason}`).then(res => res.json()).then(data => setEpisodes(data.episodes || []));
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

  const getEpisodeProviders = async (num: number) => {
    setActiveEpisode(num);
    const res = await fetch(`/api/stream?id=${selectedMovie?.id}&type=tv&s=${selectedSeason}&e=${num}`);
    const data = await res.json();
    setProviders(data.providers);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-slate-100 font-sans selection:bg-rose-500">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md p-4 md:px-12 flex items-center justify-between border-b border-white/5">
        <h1 onClick={() => { setView('home'); setQuery(''); }} className="text-2xl font-black tracking-tighter text-rose-500 cursor-pointer">DOGE<span className="text-white">MEDIA</span></h1>
        <form onSubmit={searchMedia} className="w-full max-w-md ml-4"><input type="text" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" /></form>
      </nav>

      <main className="pt-28 pb-12 px-4 md:px-12">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>{view === 'home' ? 'Tendencias' : 'Resultados'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {(view === 'home' ? trending : results).map(movie => (
            <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer transition-all duration-300 hover:scale-105">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-[#121214]"><img src={movie.poster} className="w-full h-full object-cover" loading="lazy" /></div>
              <h4 className="mt-2 font-bold text-xs truncate group-hover:text-rose-500">{movie.title}</h4>
            </div>
          ))}
        </div>
      </main>

      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md overflow-y-auto" onClick={() => { setSelectedMovie(null); setProviders([]); setActiveEpisode(null); }}>
          <div className="relative w-full max-w-5xl min-h-screen md:min-h-0 md:rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 shadow-2xl flex flex-col overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 md:h-[400px] flex-shrink-0">
              <img src={selectedMovie.backdrop} className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
              <div className="absolute bottom-0 p-6 md:p-12 w-full flex items-end gap-6">
                <img src={selectedMovie.poster} className="hidden md:block w-40 rounded-xl shadow-2xl border border-white/10" />
                <div className="flex-1">
                  <h2 className="text-3xl md:text-5xl font-black mb-2">{selectedMovie.title}</h2>
                  <div className="flex gap-3 text-[10px] font-bold opacity-60 uppercase"><span className="text-rose-500">⭐ {selectedMovie.rating.toFixed(1)}</span><span>{selectedMovie.date}</span></div>
                </div>
              </div>
              <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 text-4xl opacity-50 hover:opacity-100">×</button>
            </div>

            <div className="p-6 md:p-12 space-y-10">
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">{selectedMovie.overview || "Sin descripción."}</p>

              {/* SELECTOR DE SERVIDORES PARA PELÍCULAS */}
              {selectedMovie.type === 'movie' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black tracking-widest opacity-50">SELECCIONA UN SERVIDOR:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {providers.map((p, i) => (
                      <button key={i} onClick={() => window.open(p.url, '_blank')} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500 hover:border-rose-500 transition-all group">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-[10px] bg-black/30 px-2 py-1 rounded font-black opacity-80 group-hover:bg-white/20">{p.lang}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SELECTOR DE SERVIDORES PARA SERIES */}
              {selectedMovie.type === 'tv' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold opacity-50 tracking-widest">TEMPORADA:</span>
                    <select value={selectedSeason} onChange={e => { setSelectedSeason(Number(e.target.value)); setActiveEpisode(null); setProviders([]); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 font-bold text-rose-500">
                      {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0c]">{s.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {episodes.map(ep => (
                      <div key={ep.episode_number} className="space-y-2">
                        <div onClick={() => getEpisodeProviders(ep.episode_number)} className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeEpisode === ep.episode_number ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}>
                          <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.backdrop} className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center font-black text-xs">EP {ep.episode_number}</div>
                        </div>
                        {activeEpisode === ep.episode_number && (
                          <div className="animate-in slide-in-from-top-2 duration-300 grid grid-cols-1 gap-1">
                            {providers.map((p, i) => (
                              <button key={i} onClick={() => window.open(p.url, '_blank')} className="flex justify-between items-center p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px]">
                                <span>{p.name}</span>
                                <span className="opacity-70">{p.lang}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <h5 className="text-[10px] font-bold truncate opacity-80">{ep.name}</h5>
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
