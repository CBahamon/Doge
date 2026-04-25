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
const CUEVANA_BASE = 'https://cuevana.gs';

// --- SCRAPER DE CUEVANA.GS ---
async function scrapeCuevana(query) {
    try {
        const searchUrl = `${CUEVANA_BASE}/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const results = [];

        $('.results-post article').each((i, el) => {
            const title = $(el).find('.title').text().trim();
            const link = $(el).find('a').attr('href');
            const poster = $(el).find('img').attr('src');
            if (title && link) {
                results.push({
                    id: link, // Usamos el link como ID
                    title: title,
                    poster: poster,
                    type: link.includes('/serie/') ? 'tv' : 'movie',
                    source: 'cuevana'
                });
            }
        });
        return results;
    } catch (error) {
        console.error("Error Scraper Cuevana:", error.message);
        return [];
    }
}

// --- RUTAS ---

app.get('/api/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/trending/all/week`, {
            params: { api_key: TMDB_API_KEY, language: 'es-MX' }
        });
        const results = response.data.results.filter(item => item.media_type !== 'person').map(item => ({
            id: item.id,
            title: item.title || item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
            type: item.media_type,
            rating: item.vote_average,
            date: item.release_date || item.first_air_date
        }));
        res.json({ results });
    } catch (error) { res.status(500).json({ error: 'Error tendencias' }); }
});

app.get('/api/search', async (req, res) => {
    const { query, mode } = req.query;
    
    // Si el modo es Cuevana, usamos el scraper
    if (mode === 'cuevana') {
        const results = await scrapeCuevana(query);
        return res.json({ results });
    }

    // Si no, usamos TMDB por defecto
    try {
        const response = await axios.get(`${TMDB_BASE}/search/multi`, {
            params: { api_key: TMDB_API_KEY, query, language: 'es-MX' }
        });
        const results = response.data.results.filter(item => item.media_type !== 'person').map(item => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
            type: item.media_type,
            date: item.release_date || item.first_air_date,
            rating: item.vote_average
        }));
        res.json({ results });
    } catch (error) { res.status(500).json({ error: 'Error búsqueda' }); }
});

app.get('/api/tv/:id', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}`, { params: { api_key: TMDB_API_KEY, language: 'es-MX' } });
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: 'Error temporadas' }); }
});

app.get('/api/tv/:id/season/:number', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}/season/${req.params.number}`, { params: { api_key: TMDB_API_KEY, language: 'es-MX' } });
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: 'Error episodios' }); }
});

app.get('/api/stream', (req, res) => {
    const { id, type, s, e, mode } = req.query;
    
    // Si viene de Cuevana, el ID es el link directo
    if (mode === 'cuevana') {
        return res.json({ providers: [{ name: 'Cuevana Original', lang: 'Latino/ESP', url: id }] });
    }

    const season = s || 1;
    const episode = e || 1;

    // Servidores Latino Garantizados (Multiembed y Embed.su priorizan español)
    const providers = [
        {
            name: 'Motor Latino (Principal)',
            lang: 'Español Latino',
            url: type === 'movie' 
                ? `https://embed.su/embed/movie/${id}` 
                : `https://embed.su/embed/tv/${id}/${season}/${episode}`
        },
        {
            name: 'Motor Latino (Alternativo)',
            lang: 'Latino/España',
            url: type === 'movie' 
                ? `https://vidsrc.xyz/embed/movie/${id}` 
                : `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`
        }
    ];

    res.json({ providers });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media v6.0 (Cuevana Scraper Mode) on port ${PORT}`));
