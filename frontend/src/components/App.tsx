import React, { useState, useEffect } from 'react';

interface Movie {
  id: any;
  title: string;
  overview?: string;
  poster: string;
  backdrop?: string;
  type: string;
  rating?: number;
  date?: string;
  source?: string;
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
  const [mode, setMode] = useState<'global' | 'cuevana'>('global');
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
    if (selectedMovie && selectedMovie.type === 'tv' && selectedMovie.source !== 'cuevana') {
      fetch(`/api/tv/${selectedMovie.id}`).then(res => res.json()).then(data => {
        const valid = data.seasons?.filter((s:any) => s.season_number > 0) || [];
        setSeasons(valid);
        setSelectedSeason(valid[0]?.season_number || 1);
      });
    }
    if (selectedMovie && selectedMovie.type === 'movie') {
      const modeParam = selectedMovie.source === 'cuevana' ? '&mode=cuevana' : '';
      fetch(`/api/stream?id=${encodeURIComponent(selectedMovie.id)}&type=movie${modeParam}`).then(res => res.json()).then(data => setProviders(data.providers));
    }
  }, [selectedMovie]);

  useEffect(() => {
    if (selectedMovie && selectedMovie.type === 'tv' && selectedMovie.source !== 'cuevana') {
      fetch(`/api/tv/${selectedMovie.id}/season/${selectedSeason}`).then(res => res.json()).then(data => setEpisodes(data.episodes || []));
    }
  }, [selectedSeason, selectedMovie]);

  const searchMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setView('search');
    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&mode=${mode}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  const getEpisodeProviders = async (num: number) => {
    setActiveEpisode(num);
    const modeParam = selectedMovie?.source === 'cuevana' ? '&mode=cuevana' : '';
    const res = await fetch(`/api/stream?id=${selectedMovie?.id}&type=tv&s=${selectedSeason}&e=${num}${modeParam}`);
    const data = await res.json();
    setProviders(data.providers);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-slate-100 font-sans selection:bg-rose-500">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md p-4 md:px-12 flex flex-col md:flex-row items-center justify-between border-b border-white/5 gap-4">
        <h1 onClick={() => { setView('home'); setQuery(''); }} className="text-2xl font-black tracking-tighter text-rose-500 cursor-pointer">DOGE<span className="text-white">MEDIA</span></h1>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
          <button onClick={() => setMode('global')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${mode === 'global' ? 'bg-rose-500 text-white' : 'hover:bg-white/5'}`}>GLOBAL</button>
          <button onClick={() => setMode('cuevana')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${mode === 'cuevana' ? 'bg-rose-500 text-white' : 'hover:bg-white/5'}`}>CUEVANA (Latino)</button>
        </div>

        <form onSubmit={searchMedia} className="w-full max-w-md">
          <input type="text" placeholder={`Buscar en modo ${mode}...`} value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
        </form>
      </nav>

      <main className="pt-40 md:pt-28 pb-12 px-4 md:px-12">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>{view === 'home' ? 'Tendencias de la Semana' : `Resultados en ${mode.toUpperCase()}`}</h2>
        
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
            {(view === 'home' ? trending : results).map((movie, i) => (
              <div key={i} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-[#121214]">
                  <img src={movie.poster} className="w-full h-full object-cover" loading="lazy" />
                  {movie.source === 'cuevana' && <span className="absolute top-2 left-2 bg-rose-500 text-[8px] font-black px-2 py-0.5 rounded">LATINO</span>}
                </div>
                <h4 className="mt-2 font-bold text-[10px] md:text-xs truncate group-hover:text-rose-500">{movie.title}</h4>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md overflow-y-auto" onClick={() => { setSelectedMovie(null); setProviders([]); setActiveEpisode(null); }}>
          <div className="relative w-full max-w-5xl min-h-screen md:min-h-0 md:rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 shadow-2xl flex flex-col overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 md:h-[400px] flex-shrink-0">
              {selectedMovie.backdrop && <img src={selectedMovie.backdrop} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
              <div className="absolute bottom-0 p-6 md:p-12 w-full flex items-end gap-6">
                <img src={selectedMovie.poster} className="hidden md:block w-40 rounded-xl shadow-2xl border border-white/10" />
                <div className="flex-1">
                  <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight">{selectedMovie.title}</h2>
                  <div className="flex gap-3 text-[10px] font-bold opacity-60 uppercase"><span className="text-rose-500">⭐ {selectedMovie.rating?.toFixed(1) || 'N/A'}</span><span>{selectedMovie.date}</span></div>
                </div>
              </div>
              <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 text-4xl opacity-50 hover:opacity-100">×</button>
            </div>

            <div className="p-6 md:p-12 space-y-10">
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">{selectedMovie.overview || "Usa el botón de abajo para reproducir directamente desde el servidor de origen."}</p>

              {/* SERVIDORES */}
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-widest opacity-50 uppercase">Servidores Disponibles:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providers.length > 0 ? providers.map((p, i) => (
                    <button key={i} onClick={() => window.open(p.url, '_blank')} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500 transition-all">
                      <span className="font-bold text-sm">{p.name}</span>
                      <span className="text-[10px] bg-black/30 px-2 py-1 rounded font-black">{p.lang}</span>
                    </button>
                  )) : (
                    <div className="col-span-full text-center py-4 bg-white/5 rounded-xl text-xs opacity-50 italic">
                      {selectedMovie.type === 'tv' && selectedMovie.source === 'cuevana' 
                        ? 'Las series en modo Cuevana se reproducen directamente desde su web.' 
                        : selectedMovie.type === 'tv' ? 'Selecciona un episodio para ver los servidores.' : 'Cargando servidores...'}
                    </div>
                  )}
                  {selectedMovie.source === 'cuevana' && selectedMovie.type === 'tv' && (
                     <button onClick={() => window.open(selectedMovie.id, '_blank')} className="col-span-full p-4 rounded-xl bg-rose-500 text-white font-black text-center">▶ REPRODUCIR SERIE EN CUEVANA</button>
                  )}
                </div>
              </div>

              {/* EPISODIOS PARA MODO GLOBAL */}
              {selectedMovie.type === 'tv' && selectedMovie.source !== 'cuevana' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold opacity-50 tracking-widest">TEMPORADA:</span>
                    <select value={selectedSeason} onChange={e => { setSelectedSeason(Number(e.target.value)); setActiveEpisode(null); setProviders([]); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 font-bold text-rose-500">
                      {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0c]">{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                    {episodes.map(ep => (
                      <div key={ep.episode_number} className={`p-1 rounded-2xl border-2 transition-all ${activeEpisode === ep.episode_number ? 'border-rose-500' : 'border-transparent'}`}>
                        <div onClick={() => getEpisodeProviders(ep.episode_number)} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-white/5">
                          <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : selectedMovie.backdrop} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center font-black text-[10px]">EP {ep.episode_number}</div>
                        </div>
                        <h5 className="mt-2 text-[10px] font-bold truncate px-2">{ep.name}</h5>
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
