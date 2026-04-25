import{a as r}from"./index.CLBPsBg6.js";var g={exports:{}},p={};var y;function M(){if(y)return p;y=1;var n=Symbol.for("react.transitional.element"),o=Symbol.for("react.fragment");function c(h,a,t){var u=null;if(t!==void 0&&(u=""+t),a.key!==void 0&&(u=""+a.key),"key"in a){t={};for(var l in a)l!=="key"&&(t[l]=a[l])}else t=a;return a=t.ref,{$$typeof:n,type:h,key:u,ref:a!==void 0?a:null,props:t}}return p.Fragment=o,p.jsx=c,p.jsxs=c,p}var N;function T(){return N||(N=1,g.exports=M()),g.exports}var e=T();const q=()=>{const[n,o]=r.useState("home"),[c,h]=r.useState(""),[a,t]=r.useState([]),[u,l]=r.useState(!1),[i,v]=r.useState(null),[k,_]=r.useState([]),[C,f]=r.useState([]),[x,j]=r.useState(1);r.useEffect(()=>{i&&i.type==="tv"&&fetch(`/api/tv/${i.id}`).then(s=>s.json()).then(s=>{_(s.seasons||[]);const d=s.seasons?.find(m=>m.season_number>0)||s.seasons?.[0];j(d?.season_number||1)})},[i]),r.useEffect(()=>{i&&i.type==="tv"&&fetch(`/api/tv/${i.id}/season/${x}`).then(s=>s.json()).then(s=>f(s.episodes||[]))},[x,i]);const R=async s=>{s.preventDefault(),l(!0);try{const m=await(await fetch(`/api/search?query=${encodeURIComponent(c)}`)).json();t(m.results||[])}catch(d){console.error(d)}finally{l(!1)}},w=async s=>{const m={anime:"ani-cli",movies:"mov-cli",cuevana:"cuevana"}[n]||"mov-cli",S=x,E=s||1;try{const b=await(await fetch(`/api/stream?title=${encodeURIComponent(i?.title||"")}&source=${m}&s=${S}&e=${E}`)).json();b.url&&window.open(b.url,"_blank")}catch{alert("Error al obtener video")}};return e.jsxs("div",{className:"container",style:{padding:"1rem",maxWidth:"1200px",margin:"0 auto"},children:[n==="home"&&e.jsxs("div",{style:{textAlign:"center",marginTop:"5vh"},children:[e.jsx("h1",{className:"main-title",children:"Doge Media"}),e.jsxs("div",{className:"home-grid",children:[e.jsxs("div",{className:"glass-container card-hover option-card",onClick:()=>o("anime"),children:[e.jsx("span",{className:"icon",children:"⛩️"}),e.jsx("h2",{children:"Anime"})]}),e.jsxs("div",{className:"glass-container card-hover option-card",onClick:()=>o("movies"),children:[e.jsx("span",{className:"icon",children:"🎬"}),e.jsx("h2",{children:"Cine y TV"})]}),e.jsxs("div",{className:"glass-container card-hover option-card",onClick:()=>o("cuevana"),children:[e.jsx("span",{className:"icon",children:"💎"}),e.jsx("h2",{children:"Cuevana"})]})]})]}),n!=="home"&&e.jsxs("div",{children:[e.jsxs("header",{className:"view-header",children:[e.jsx("button",{className:"btn btn-primary",onClick:()=>{o("home"),t([]),h("")},children:"← Volver"}),e.jsx("form",{onSubmit:R,style:{flex:1},children:e.jsx("input",{className:"glass-container search-input",placeholder:`Buscar en ${n}...`,value:c,onChange:s=>h(s.target.value)})})]}),e.jsx("div",{className:"movie-grid",children:a.map(s=>e.jsxs("div",{className:"glass-container movie-card",onClick:()=>v(s),children:[e.jsx("img",{src:s.poster,alt:s.title}),e.jsx("h4",{className:"movie-title",children:s.title})]},s.id))})]}),i&&e.jsx("div",{className:"modal-overlay",onClick:()=>{v(null),f([])},children:e.jsxs("div",{className:"glass-container modal-content",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("img",{src:i.poster,className:"modal-poster",alt:i.title}),e.jsxs("div",{className:"modal-info",children:[e.jsx("h1",{children:i.title}),e.jsx("p",{className:"overview",children:i.overview}),i.type==="movie"&&e.jsx("button",{className:"btn btn-primary play-btn",onClick:()=>w(),children:"▶️ Reproducir Película"})]})]}),i.type==="tv"&&e.jsxs("div",{className:"episodes-area",children:[e.jsx("label",{children:"Temporada:"}),e.jsx("select",{className:"glass-container select-season",value:x,onChange:s=>j(Number(s.target.value)),children:k.filter(s=>s.season_number>0).map(s=>e.jsx("option",{value:s.season_number,children:s.name},s.id))}),e.jsx("div",{className:"episode-list",children:C.map(s=>e.jsxs("div",{className:"glass-container episode-item",onClick:()=>w(s.episode_number),children:[e.jsx("div",{className:"ep-thumb",children:s.still_path?e.jsx("img",{src:`https://image.tmdb.org/t/p/w300${s.still_path}`,alt:s.name}):e.jsx("div",{className:"no-img"})}),e.jsx("div",{className:"ep-info",children:e.jsxs("strong",{children:[s.episode_number,". ",s.name]})})]},s.episode_number))})]}),e.jsx("button",{className:"close-x",onClick:()=>v(null),children:"×"})]})}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
      `}})]})};export{q as default};
