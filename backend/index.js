require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Middleware simple para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// RUTA DE PRUEBA: Estado del servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', platform: process.platform });
});

// RUTA: Buscar Películas/Anime (TMDB Placeholder)
app.get('/api/search', async (req, res) => {
  const { query, type } = req.query; // type: 'movie' o 'tv' o 'anime'
  
  if (!query) return res.status(400).json({ error: 'Query is required' });

  console.log(`Buscando ${type || 'todo'} para: ${query}`);
  
  // Aquí irá la lógica de TMDB
  res.json({
    results: [
      {
        id: 1,
        title: `${query} (Ejemplo)`,
        overview: 'Esta es una descripción de prueba para ver el diseño.',
        poster_path: 'https://via.placeholder.com/500x750?text=Poster',
        release_date: '2024-01-01',
        media_type: type || 'movie'
      }
    ]
  });
});

// RUTA: Obtener link de video
app.get('/api/stream', (req, res) => {
  const { name, type } = req.query;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  // Si estamos en Windows/PC, devolvemos un video de prueba
  if (process.platform === 'win32') {
    return res.json({
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      provider: 'mock-provider'
    });
  }

  // Si estamos en Linux (el celular), ejecutamos el scraper
  let command = '';
  if (type === 'anime') {
    command = `ani-cli -u "${name}" --get-url`;
  } else {
    // Aquí irá el scraper de Cuevana o mov-cli
    command = `echo "https://sample-link.com/video.mp4"`; 
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
        return res.status(500).json({ error: 'Error al obtener el stream', details: error.message });
    }
    res.json({ url: stdout.trim(), provider: type === 'anime' ? 'ani-cli' : 'scraper' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend media server running on http://localhost:${PORT}`);
});
