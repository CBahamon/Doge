require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// --- BÚSQUEDA ---
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

// --- DETALLES ---
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

// --- STREAMING (LIMPIEZA TOTAL) ---
app.get('/api/stream', (req, res) => {
    const { title, source, s, e } = req.query;
    const season = s || 1;
    const episode = e || 1;

    if (process.platform === 'win32') {
        return res.json({ url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4' });
    }

    let command = '';
    
    if (source === 'ani-cli') {
        // Probamos el comando que te funcionó manual
        command = `printf "1\n" | ani-cli "${title}" -e ${episode} --get-url`;
    } 
    else if (source === 'mov-cli') {
        command = `printf "1\n" | MOV_CLI_PLAYER=echo mov-cli "${title}" -p vidsrc -s ${season} -e ${episode}`;
    }

    console.log(`Ejecutando: ${command}`);

    // Aumentamos el tiempo de espera a 60 segundos porque estas herramientas son lentas
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
        const output = stdout + "\n" + stderr;
        console.log("Salida completa de la terminal:", output);

        const urlRegex = /(https?:\/\/[^\s"'`<>]+)/g;
        const matches = output.match(urlRegex);
        
        if (matches && matches.length > 0) {
            // Buscamos una URL que parezca de video (m3u8, mp4, etc) o la última
            const finalUrl = matches.reverse().find(u => u.includes('m3u8') || u.includes('mp4') || u.includes('google') || u.includes('vid')) || matches[0];
            console.log(`URL Capturada: ${finalUrl}`);
            return res.json({ url: finalUrl });
        }

        res.status(404).json({ error: 'No se encontró el link', output: output });
    });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => console.log(`Doge Media v2.3 - Port ${PORT}`));
