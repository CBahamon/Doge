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

// --- MOTOR DE STREAMING (EXTRACCIÓN ROBUSTA) ---
app.get('/api/stream', (req, res) => {
    const { title, source, s, e } = req.query;
    const season = s || 1;
    const episode = e || 1;

    if (process.platform === 'win32') {
        return res.json({ url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4' });
    }

    let command = '';
    
    if (source === 'ani-cli') {
        command = `printf "1\n${episode}\n" | ani-cli "${title}" --get-url`;
    } 
    else if (source === 'mov-cli') {
        // Quitamos flags problemáticos y usamos el entorno para forzar salida
        command = `printf "1\n" | MOV_CLI_PLAYER=echo mov-cli "${title}" -p vidsrc -s ${season} -e ${episode}`;
    }

    console.log(`Ejecutando: ${command}`);

    exec(command, (error, stdout, stderr) => {
        // Incluso si hay error en stderr, intentamos buscar una URL en stdout
        const output = stdout + "\n" + stderr;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = output.match(urlRegex);
        
        if (matches && matches.length > 0) {
            // Buscamos la última URL que suele ser la del streaming final
            const finalUrl = matches[matches.length - 1];
            console.log(`URL Extraída: ${finalUrl}`);
            return res.json({ url: finalUrl });
        }

        if (error) return res.status(500).json({ error: 'No se pudo obtener el link', details: error.message });
        res.status(404).json({ error: 'No se encontró ninguna URL en la salida' });
    });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media Server v2.2 (Robust Mode) on port ${PORT}`));
