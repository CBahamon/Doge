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

// --- MOTOR DE BÚSQUEDA (TMDB) ---
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
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
                backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                type: item.media_type,
                date: item.release_date || item.first_air_date,
                rating: item.vote_average
            }));
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Error en búsqueda' });
    }
});

// --- DETALLES DE SERIE ---
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

// --- MOTOR DE STREAMING (FIXED) ---
app.get('/api/stream', (req, res) => {
    const { id, type, s, e } = req.query;
    
    console.log(`Petición Recibida - ID: ${id}, Tipo: ${type}, T: ${s}, E: ${e}`);

    if (!id || !type) {
        return res.status(400).json({ error: 'Faltan parámetros críticos (id o type)' });
    }

    const season = s || 1;
    const episode = e || 1;

    const providers = {
        vidsrc_to: type === 'movie' 
            ? `https://vidsrc.to/embed/movie/${id}` 
            : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
        
        vidlink: type === 'movie'
            ? `https://vidlink.pro/movie/${id}`
            : `https://vidlink.pro/tv/${id}/${season}/${episode}`
    };

    res.json({ 
        best_link: providers.vidlink // Vidlink suele ser más estable hoy
    });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media v3.1 (Fixed Params) on port ${PORT}`));
