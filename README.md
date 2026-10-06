# अनुगाथा (Anugatha) — Relics of Civilization

> **"A JOURNEY THROUGH THE PILLARS OF CIVILIZATION. SIX ORDERS. ONE CIVILIZATION."**

A dark antique, museum-grade editorial gallery web application inspired by ancient civilizations, monolithic architecture, and celestial navigation.

---

## 🏛️ The Six Orders (Pillars)

| Order | Sanskrit | Domain | Emblem | Color Motif |
| :--- | :--- | :--- | :--- | :--- |
| **Sindhu** | सिन्धु | Rivers, Oceans & Maritime Trade | Ancient Ship & Tidal Basin | Deep Sea Teal (`#14b8a6`) |
| **Aakar** | आकार | Architects, Sculptors & Creators | Monolith Temple Sanctum & Pillar | Antique Gold (`#eab308`) |
| **Pragya** | प्रज्ञा | Knowledge, Philosophy & Ideas | Sacred Codex & Palm Leaves | Jade / Emerald (`#10b981`) |
| **Kshatra** | क्षात्र | Protectors, Warriors & Courage | Royal Lion & Wootz Talwar | Crimson Garnet (`#ef4444`) |
| **Aarohan** | आरोहण | Explorers, Navigators & Discovery | Celestial Astrolabe & Polaris Compass | Sapphire / Lapis (`#3b82f6`) |
| **Utkarsh** | उत्कर्ष | Prosperity, Commerce & Craftsmanship | Gilded Kalasha & Silver Karshapana | Royal Amethyst (`#a855f7`) |

---

## ✨ Features

1. **Dual Viewing Modes (Directly Matching the Design Mockups)**:
   - **Editorial Arches (Option 1)**: Arched relic cards (`rounded-t-full`), stone texture vignettes, curatorial placards, provenance tags, and glowing borders.
   - **Spatial Orbit (Option 2)**: Concentric celestial astrolabe orbits (`20.5090°` meridian markings) with an interactive central monolith hub and orbiting order relic nodes.
2. **Interactive Relic Inspection (Lightbox Modal)**:
   - High-definition view, Devanagari Sanskrit inscription, era dating, excavation provenance, curatorial notes with wax seal motif, and catalogue tags.
3. **Relic Submission & Image Upload**:
   - Inscribe new antiquities with file upload (`multer`) or external image URL.
   - Categorize by Order, dating, and curatorial epigraphs.
4. **Synthesized Sacred Ambience (Web Audio API)**:
   - Zero-dependency meditative 108Hz / 162Hz harmonic drone and Tibetan singing bowl chimes toggleable from the navigation bar.
5. **Real-time Order Filtering & Search**:
   - Filter by any of the 6 orders or search across titles, inscriptions, lore, and excavation sites.

---

## 🚀 Running the Project

### 1. Configure the administrator and start the backend (Port 5001)
```bash
cd backend
npm install
cp .env.example .env
# Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before starting.
npm start
```
*The API will be available at `http://localhost:5001`.*

### 2. Start the frontend dev server (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000/gallery` for visitors or `http://localhost:3000/admin` to sign in.*

### Gallery operations

- Public clients can only read published albums. Album creation, editing, publishing, upload, and deletion require an authenticated administrator session.
- Admin credentials are read only by the backend from environment variables or the ignored local `backend/.env` file. Login uses an HttpOnly, SameSite=Strict cookie; use HTTPS in production (`NODE_ENV=production`). Do not commit `.env`.
- Albums and photo metadata persist in `backend/src/data/gallery.json`; originals and generated WebP files are stored in `backend/uploads/`. Both are ignored by Git. Back up these paths for local deployments.
- Uploads preserve the source for archival download and generate 480px, 1200px, and 1920px WebP renditions. Public grids use responsive `srcset` and lazy loading.
- Set `FRONTEND_ORIGIN` to the exact browser origin used for the gallery, including in development (`http://localhost:3000` by default), because authenticated mutations validate it. For cross-origin production deployments use HTTPS; if the frontend is on a different site, set `ADMIN_COOKIE_SAME_SITE=None` (Secure cookies require HTTPS). Set `API_PROXY_TARGET` to change the Vite development proxy target.
- JSON-file storage and in-memory sessions target a single backend instance. Replace those storage boundaries with shared database/object storage and shared sessions before scaling to multiple instances.
- Configure the deployment host to serve the SPA entry for `/gallery` and `/admin`, and reverse-proxy `/api` and `/uploads` to Express. Terminate HTTPS before exposing the admin login.
- Run backend integration tests from the project root with `npm run test:backend`.

---

## 📂 Project Structure

```
anugatha-gallery/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express app, static uploads, CORS
│   │   ├── routes/
│   │   │   └── artifacts.js   # REST API for relics, orders, and image uploads
│   │   └── data/
│   │       └── seedData.json  # Curated historical relics across 6 orders
│   ├── uploads/               # User-uploaded relic images
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Monogram logo, sound toggle, view toggle
    │   │   ├── HeroBanner.jsx       # Sanskrit title "अनुगाथा" & 6 Arched Gateways
    │   │   ├── OrderFilter.jsx      # Order badges, search, count chips
    │   │   ├── EditorialGallery.jsx # Option 1: Arched cards & curatorial placards
    │   │   ├── SpatialOrbit.jsx     # Option 2: Celestial orbit astrolabe view
    │   │   ├── ArtifactModal.jsx    # Relic dossier & lightbox
    │   │   ├── SubmitModal.jsx      # Upload new relic form
    │   │   └── useAmbienceAudio.js  # Web Audio synthesized sacred drone
    │   ├── data/
    │   │   └── ordersConfig.js      # 6 Orders definitions, colors, symbols
    │   ├── App.jsx                  # Main coordinator
    │   ├── index.css                # Custom fonts, gold foil, dark textures
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```
