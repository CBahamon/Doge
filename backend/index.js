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

// --- MOTOR DE BÚSQUEDA (TMDB) ---
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
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
        console.error("Error en búsqueda TMDB:", error.message);
        res.status(500).json({ error: 'Error en búsqueda' });
    }
});

// --- MOTOR DE STREAMING (EL PUENTE) ---
app.get('/api/stream', (req, res) => {
    const { title, source } = req.query;

    console.log(`Petición de streaming: ${title} via ${source}`);

    if (process.platform === 'win32') {
        return res.json({ 
            url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
            provider: 'test-pc' 
        });
    }

    let command = '';

    // Usamos printf "1\n" para que elija automáticamente el primer resultado de la lista
    if (source === 'ani-cli') {
        command = `printf "1\n" | ani-cli "${title}" --get-url`;
    } 
    else if (source === 'mov-cli') {
        command = `printf "1\n" | mov-cli "${title}" -p vidsrc --get-url`;
    } 
    else {
        command = `echo "https://sample-link.com/video.mp4"`;
    }

    console.log(`Ejecutando comando: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error de ejecución: ${error.message}`);
            return res.status(500).json({ error: 'Error al ejecutar herramienta', details: error.message });
        }
        
        if (stderr) console.warn(`Advertencia de terminal: ${stderr}`);

        const lines = stdout.trim().split('\n');
        const url = lines[lines.length - 1]; // Extraemos la última línea que es la URL
        
        console.log(`URL obtenida: ${url}`);
        res.json({ url: url, provider: source });
    });
});

// Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Ruta para SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Doge Media corriendo en puerto ${PORT}`);
});
