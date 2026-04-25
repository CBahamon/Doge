import{a as t}from"./index.CLBPsBg6.js";var v={exports:{}},p={};var w;function C(){if(w)return p;w=1;var o=Symbol.for("react.transitional.element"),n=Symbol.for("react.fragment");function c(x,a,i){var m=null;if(i!==void 0&&(m=""+i),a.key!==void 0&&(m=""+a.key),"key"in a){i={};for(var l in a)l!=="key"&&(i[l]=a[l])}else i=a;return a=i.ref,{$$typeof:o,type:x,key:m,ref:a!==void 0?a:null,props:i}}return p.Fragment=n,p.jsx=c,p.jsxs=c,p}var k;function _(){return k||(k=1,v.exports=C()),v.exports}var e=_();const $=()=>{const[o,n]=t.useState("home"),[c,x]=t.useState(""),[a,i]=t.useState([]),[m,l]=t.useState(!1),[s,g]=t.useState(null),[y,N]=t.useState([]),[E,R]=t.useState([]),[h,b]=t.useState(1);t.useEffect(()=>{s&&s.type==="tv"&&fetch(`/api/tv/${s.id}`).then(r=>r.json()).then(r=>{const u=r.seasons?.filter(d=>d.season_number>0)||[];N(u),b(u[0]?.season_number||1)})},[s]),t.useEffect(()=>{s&&s.type==="tv"&&fetch(`/api/tv/${s.id}/season/${h}`).then(r=>r.json()).then(r=>R(r.episodes||[]))},[h,s]);const S=async r=>{r.preventDefault(),l(!0);const d=await(await fetch(`/api/search?query=${encodeURIComponent(c)}`)).json();i(d.results||[]),l(!1)},f=async r=>{const d={anime:"ani-cli",movies:"mov-cli",cuevana:"cuevana"}[o]||"mov-cli",j=await(await fetch(`/api/stream?title=${encodeURIComponent(s?.title||"")}&source=${d}&s=${h}&e=${r||1}`)).json();j.url&&window.open(j.url,"_blank")};return e.jsxs("div",{className:"app-container",children:[o==="home"&&e.jsxs("div",{className:"home-screen",children:[e.jsxs("h1",{className:"logo",children:["DOGE ",e.jsx("span",{children:"MEDIA"})]}),e.jsxs("div",{className:"main-options",children:[e.jsxs("div",{className:"opt-card",onClick:()=>n("anime"),children:[e.jsx("div",{className:"opt-icon",children:"⛩️"}),e.jsx("h3",{children:"ANIME"})]}),e.jsxs("div",{className:"opt-card",onClick:()=>n("movies"),children:[e.jsx("div",{className:"opt-icon",children:"🎬"}),e.jsx("h3",{children:"CINE & TV"})]}),e.jsxs("div",{className:"opt-card",onClick:()=>n("cuevana"),children:[e.jsx("div",{className:"opt-icon",children:"💎"}),e.jsx("h3",{children:"CUEVANA"})]})]})]}),o!=="home"&&e.jsxs("div",{className:"browse-screen",children:[e.jsxs("header",{className:"header",children:[e.jsx("button",{className:"back-btn",onClick:()=>{n("home"),i([])},children:"←"}),e.jsx("form",{onSubmit:S,className:"search-form",children:e.jsx("input",{placeholder:`Buscar en ${o}...`,value:c,onChange:r=>x(r.target.value)})})]}),e.jsx("div",{className:"results-grid",children:a.map(r=>e.jsxs("div",{className:"movie-item",onClick:()=>g(r),children:[e.jsx("img",{src:r.poster,alt:r.title}),e.jsx("div",{className:"movie-info-mini",children:e.jsxs("span",{className:"rating",children:["⭐ ",r.rating.toFixed(1)]})})]},r.id))})]}),s&&e.jsx("div",{className:"modal-overlay",onClick:()=>g(null),children:e.jsxs("div",{className:"modal-container",onClick:r=>r.stopPropagation(),style:{backgroundImage:`linear-gradient(to bottom, rgba(15, 12, 41, 0.8), #0f0c29), url(${s.backdrop})`},children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("img",{src:s.poster,className:"main-poster"}),e.jsxs("div",{className:"main-details",children:[e.jsx("h1",{children:s.title}),e.jsx("p",{className:"description",children:s.overview}),s.type==="movie"&&e.jsx("button",{className:"play-main-btn",onClick:()=>f(),children:"▶ REPRODUCIR AHORA"})]})]}),s.type==="tv"&&e.jsxs("div",{className:"tv-area",children:[e.jsxs("div",{className:"season-picker",children:[e.jsx("span",{children:"Temporada"}),e.jsx("select",{value:h,onChange:r=>b(Number(r.target.value)),children:y.map(r=>e.jsx("option",{value:r.season_number,children:r.name},r.id))})]}),e.jsx("div",{className:"episodes-scroll",children:E.map(r=>e.jsxs("div",{className:"ep-card",onClick:()=>f(r.episode_number),children:[e.jsxs("div",{className:"ep-img-container",children:[e.jsx("img",{src:r.still_path?`https://image.tmdb.org/t/p/w300${r.still_path}`:s.poster}),e.jsx("div",{className:"ep-play-overlay",children:"▶"})]}),e.jsxs("div",{className:"ep-meta",children:[e.jsx("span",{className:"ep-num",children:r.episode_number}),e.jsx("span",{className:"ep-title",children:r.name})]})]},r.episode_number))})]}),e.jsx("button",{className:"close-modal",onClick:()=>g(null),children:"×"})]})}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
      `}})]})};export{$ as default};
