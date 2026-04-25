# Celular Media Server

Este proyecto transforma un celular Android (Redmi Note 9S) en un servidor de streaming headless.

## Estructura
- `/backend`: API en Node.js (Express) que se comunica con scrapers de terminal (`ani-cli`, `mov-cli`).
- `/frontend`: Interfaz web moderna (Astro + React) con estética Glassmorphism.

## Requisitos
- **En PC:** Node.js (v18+) instalado.
- **En Celular:** Termux con Ubuntu (proot-distro) y SSH configurado.

## Instalación y Desarrollo

### 1. Clonar en PC y Celular
```bash
git clone <tu-repo>
```

### 2. Ejecutar Backend (en el Celular)
```bash
cd backend
npm install
npm start
```

### 3. Ejecutar Frontend (en PC para desarrollo)
```bash
cd frontend
npm install
npm run dev
```

## Próximos Pasos
- [ ] Implementar scraper de Cuevana.gs en el backend.
- [ ] Integrar API de TMDB para metadatos.
- [ ] Mejorar la navegación con control remoto para Smart TV.
