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
const CUEVANA_URL = 'https://cuevana.gs';

// --- UTILIDADES DEL SCRAPER ---

async function searchCuevana(query) {
    try {
        const searchUrl = `${CUEVANA_URL}/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.result-item').each((i, element) => {
            if (i < 5) { // Solo los primeros 5 resultados
                const title = $(element).find('.title a').text();
                const link = $(element).find('.title a').attr('href');
                const image = $(element).find('img').attr('src');
                results.push({ title, link, image });
            }
        });

        return results;
    } catch (error) {
        console.error('Error en searchCuevana:', error.message);
        return [];
    }
}

// --- RUTAS API ---

app.get('/api/search', async (req, res) => {
    const { query, type } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    console.log(`Buscando en Cuevana: ${query}`);
    
    // Si es anime, podríamos usar ani-cli, pero por ahora busquemos en Cuevana
    const results = await searchCuevana(query);
    
    res.json({ results });
});

app.get('/api/stream', async (req, res) => {
    const { url, name, type } = req.query;

    // Lógica para Anime con ani-cli (Solo funciona en el celular)
    if (type === 'anime' && process.platform !== 'win32') {
        exec(`ani-cli -u "${name}" --get-url`, (error, stdout) => {
            if (error) return res.status(500).json({ error: 'Error en ani-cli' });
            return res.json({ url: stdout.trim(), provider: 'ani-cli' });
        });
        return;
    }

    // Lógica para Cuevana (Simplificada: Por ahora devolvemos el link de la página para procesarlo)
    // El scraping de links profundos (iframes) suele requerir un paso extra que haremos después
    if (url) {
        return res.json({ 
            url: url, 
            message: "En un futuro aquí extraeremos el .mp4 directamente del iframe",
            provider: 'cuevana' 
        });
    }

    // Mock para PC
    if (process.platform === 'win32') {
        return res.json({
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            provider: 'mock'
        });
    }

    res.status(400).json({ error: 'Faltan parámetros' });
});

app.listen(PORT, () => {
    console.log(`Backend Scraper running on http://localhost:${PORT}`);
});
