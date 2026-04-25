require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

app.get('/api/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/trending/all/week`, {
            params: { api_key: TMDB_API_KEY, language: 'es-MX' }
        });
        const results = response.data.results
            .filter(item => item.media_type !== 'person')
            .map(item => ({
                id: item.id,
                title: item.title || item.name,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
                backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
                type: item.media_type,
                rating: item.vote_average,
                date: item.release_date || item.first_air_date
            }));
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tendencias' });
    }
});

app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`${TMDB_BASE}/search/multi`, {
            params: { api_key: TMDB_API_KEY, query, language: 'es-MX' }
        });
        const results = response.data.results
            .filter(item => item.media_type !== 'person')
            .map(item => ({
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
    } catch (error) {
        res.status(500).json({ error: 'Error en búsqueda' });
    }
});

app.get('/api/tv/:id', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}`, {
            params: { api_key: TMDB_API_KEY, language: 'es-MX' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener temporadas' });
    }
});

app.get('/api/tv/:id/season/:number', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/tv/${req.params.id}/season/${req.params.number}`, {
            params: { api_key: TMDB_API_KEY, language: 'es-MX' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener episodios' });
    }
});

app.get('/api/stream', (req, res) => {
    const { id, type, s, e } = req.query;
    const season = s || 1;
    const episode = e || 1;

    // Generamos 4 proveedores diferentes para que el usuario elija
    const providers = [
        {
            name: 'Servidor Latino 1',
            lang: 'Latino/ESP',
            url: type === 'movie' 
                ? `https://vidsrc.xyz/embed/movie/${id}` 
                : `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`
        },
        {
            name: 'Servidor Latino 2',
            lang: 'Latino/ESP',
            url: type === 'movie' 
                ? `https://vidsrc.icu/embed/movie/${id}` 
                : `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`
        },
        {
            name: 'Servidor Estable',
            lang: 'Multi/Sub',
            url: type === 'movie' 
                ? `https://vidsrc.to/embed/movie/${id}` 
                : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        },
        {
            name: 'Servidor HD',
            lang: 'Inglés/Sub',
            url: type === 'movie'
                ? `https://vidlink.pro/movie/${id}`
                : `https://vidlink.pro/tv/${id}/${season}/${episode}`
        }
    ];

    res.json({ providers });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media v5.5 (Multi-Server) on port ${PORT}`));
