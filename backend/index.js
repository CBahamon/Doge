require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// --- NUEVO SCRAPER CUEVANA3 (MÁS ESTABLE) ---
async function scrapeCuevana(query) {
    try {
        // Cuevana3 usa este formato de búsqueda
        const searchUrl = `https://cuevana3.ch/search.html?keyword=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 5000
        });
        const $ = cheerio.load(data);
        const results = [];

        // Buscamos en la cuadrícula de resultados
        $('.xxx-grid article, .list-movies .movie').each((i, el) => {
            const title = $(el).find('h2, .title').text().trim();
            const link = $(el).find('a').attr('href');
            let poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            
            if (title && link) {
                // Aseguramos que el link sea absoluto
                const fullLink = link.startsWith('http') ? link : `https://cuevana3.ch${link}`;
                results.push({
                    id: fullLink,
                    title: title,
                    poster: poster,
                    type: fullLink.includes('/serie/') ? 'tv' : 'movie',
                    source: 'cuevana'
                });
            }
        });
        return results;
    } catch (error) {
        console.error("Error Scraper Cuevana3:", error.message);
        return [];
    }
}

// --- RUTAS API ---

app.get('/api/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/trending/all/week`, { params: { api_key: TMDB_API_KEY, language: 'es-MX' } });
        res.json({ results: response.data.results.filter(item => item.media_type !== 'person').map(item => ({
            id: item.id, title: item.title || item.name, poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`, type: item.media_type, rating: item.vote_average, date: item.release_date || item.first_air_date
        }))});
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/search', async (req, res) => {
    const { query, mode } = req.query;
    if (mode === 'cuevana') {
        const results = await scrapeCuevana(query);
        return res.json({ results });
    }
    try {
        const response = await axios.get(`${TMDB_BASE}/search/multi`, { params: { api_key: TMDB_API_KEY, query, language: 'es-MX' } });
        res.json({ results: response.data.results.filter(item => item.media_type !== 'person').map(item => ({
            id: item.id, title: item.title || item.name, overview: item.overview, poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`, type: item.media_type, date: item.release_date || item.first_air_date, rating: item.vote_average
        }))});
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/tv/:id', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}`, { params: { api_key: TMDB_API_KEY, language: 'es-MX' } });
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/tv/:id/season/:number', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}/season/${req.params.number}`, { params: { api_key: TMDB_API_KEY, language: 'es-MX' } });
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/stream', (req, res) => {
    const { id, type, s, e, mode } = req.query;
    if (mode === 'cuevana') return res.json({ providers: [{ name: 'Cuevana Latino', lang: 'Español Latino', url: id }] });
    
    const season = s || 1;
    const episode = e || 1;
    const providers = [
        { name: 'Latino (Fuerza 1)', lang: 'Español Latino', url: type === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${season}/${episode}` },
        { name: 'Latino (Fuerza 2)', lang: 'Latino/ESP', url: type === 'movie' ? `https://vidsrc.icu/embed/movie/${id}` : `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}` },
        { name: 'Original / Sub', lang: 'Multi/Sub', url: type === 'movie' ? `https://vidlink.pro/movie/${id}` : `https://vidlink.pro/tv/${id}/${season}/${episode}` }
    ];
    res.json({ providers });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media v6.1 PRO on port ${PORT}`));
