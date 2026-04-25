require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// --- MOTOR DE BÚSQUEDA ---
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
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

// --- MOTOR DE STREAMING (CON CUEVANA RESTAURADO) ---
app.get('/api/stream', (req, res) => {
    const { title, source, s, e } = req.query;
    const season = s || 1;
    const episode = e || 1;

    if (process.platform === 'win32') {
        return res.json({ url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4' });
    }

    let command = '';
    if (source === 'ani-cli') {
        command = `printf "1\n" | ani-cli "${title}" -e ${episode} --get-url`;
    } 
    else if (source === 'mov-cli') {
        command = `printf "1\n" | mov-cli "${title}" -p vidsrc -s ${season} -e ${episode} --get-url`;
    } 
    else if (source === 'cuevana') {
        // Mock de cuevana por ahora hasta perfeccionar el extractor
        command = `echo "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`; 
    }

    exec(command, (error, stdout) => {
        if (error) return res.status(500).json({ error: error.message });
        const lines = stdout.trim().split('\n');
        res.json({ url: lines[lines.length - 1] });
    });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Servidor Doge Media corriendo en puerto ${PORT}`));
