# 🚀 Doge Media Server - Guía Técnica

Este proyecto transforma un **Redmi Note 9S** (Snapdragon 720G) en un servidor de streaming profesional y portátil. A continuación, se detalla la arquitectura y el funcionamiento para futuros cambios.

## 🏗️ Arquitectura del Sistema
El servidor funciona bajo un modelo de **Muñeca Rusa**:
1. **Hardware:** Redmi Note 9S (Android).
2. **Entorno:** Termux con una instancia de **Ubuntu** (vía `proot-distro`).
3. **Backend:** Node.js (Express) que gestiona la lógica y sirve la web.
4. **Frontend:** Astro + React + Tailwind CSS (empaquetado en `/frontend/dist`).

---

## 🛠️ Motores de Búsqueda y Streaming

### 1. Metadatos (TMDB API)
- **Función:** Proporciona pósters, sinopsis, calificaciones y IDs de Hollywood.
- **Ruta:** `/api/search` y `/api/trending`.
- **Importancia:** Es el "cerebro" que permite que la app se vea como Netflix.

### 2. Modo GLOBAL (Embed APIs)
- **Proveedores:** `embed.su`, `vidsrc.xyz`, `vidsrc.to`, `vidlink.pro`.
- **Lógica:** Construye una URL usando el ID de TMDB.
- **Idiomas:** Prioriza `embed.su` y `vidsrc.xyz` para contenido en **Español Latino**.

### 3. Modo CUEVANA (Scraper Real)
- **Función:** "Raspa" directamente el sitio `cuevana3.ch`.
- **Lógica:** 
  1. El backend entra a la URL de búsqueda de Cuevana.
  2. Usa `cheerio` para leer el código HTML y extraer títulos y links.
  3. Al reproducir, redirige al usuario al link original de Cuevana, garantizando audio 100% en español.
- **Ruta:** `/api/search?mode=cuevana`.

---

## 📱 Optimización para el Celular (MIUI)
Para que el servidor no se apague solo:
1. **Termux Wake Lock:** Mantener proceso activo desde la notificación.
2. **Ajustes de MIUI:** 
   - Ahorro de batería: **Sin restricciones**.
   - Inicio automático: **Activado**.
   - Candado en la multitarea: **Cerrado**.
3. **Dependencias de Sistema:** El Ubuntu del celular debe tener instalado `fzf` y `mpv` para que algunas herramientas de apoyo no den error.

---

## 🔄 Flujo de Trabajo (Mantenimiento)
Si quieres cambiar el diseño o la lógica:
1. **Desarrollo (PC):** Modifica el código en `/frontend` o `/backend`.
2. **Compilación (PC):** 
   ```bash
   cd frontend
   npm run build
   ```
3. **Sincronización (PC):** 
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```
4. **Despliegue (Celular):** 
   ```bash
   git pull
   npm start
   ```

---

## 🚀 Posibles Mejoras Futuras
- **Base de Datos:** Implementar `sqlite` para guardar una lista de "Favoritos".
- **Filtros por Género:** Añadir botones para filtrar por Terror, Comedia, etc.
- **Auto-Update:** Un script que ejecute `git pull` automáticamente al iniciar.

---
**Desarrollado con pasión para transformar tecnología vieja en herramientas potentes. 🎬🍿**
