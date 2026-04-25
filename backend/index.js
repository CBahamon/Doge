require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// --- MOTOR DE BÚSQUEDA (TMDB) ---
app.get('/api/search', async (req, res) => {
    const { query, type } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
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

// --- MOTOR DE STREAMING (EL PUENTE) ---
app.get('/api/stream', (req, res) => {
    const { title, type, source } = req.query; // source: 'ani-cli', 'mov-cli', 'cuevana'

    if (process.platform === 'win32') {
        return res.json({
            url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
            provider: 'test-pc'
        });
    }

    let command = '';

    if (source === 'ani-cli') {
        // -u especifica el nombre, --get-url devuelve solo el link
        command = `ani-cli -u "${title}" --get-url`;
    }
    else if (source === 'mov-cli') {
        // mov-cli puede ser lento, usamos vidsrc como provider por defecto
        command = `mov-cli "${title}" -p vidsrc --get-url`;
    }
    else if (source === 'cuevana') {
        // Aquí llamaríamos a la lógica de extracción de cuevana
        command = `echo "https://servidor-cuevana.com/video.mp4"`;
    }

    exec(command, (error, stdout) => {
        if (error) return res.status(500).json({ error: 'Error al ejecutar herramienta', details: error.message });

        // Limpiamos la salida por si las herramientas tiran basura de logs
        const lines = stdout.trim().split('\n');
        const url = lines[lines.length - 1]; // La última línea suele ser la URL

        res.json({ url: url, provider: source });
    });
});

const path = require('path');
// Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Si alguien entra a la raíz, enviarle el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Triple-Motor corriendo en http://localhost:${PORT}`);
});
