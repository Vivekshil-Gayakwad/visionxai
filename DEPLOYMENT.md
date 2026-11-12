# VisionXAI — Production Deployment Guide

This guide provides end-to-end instructions for deploying the **VisionXAI** tele-ophthalmology screening system, including the React frontend, FastAPI backend, Explainable AI models (XGBoost, TreeSHAP, EfficientNet ONNX), and persistent clinical database.

---

## 🏗️ System Architecture

```
[ Client Browsers / Mobile Devices ]
                 │
                 ▼
     [ Reverse Proxy / HTTPS ] (Port 80/443 or Cloud Provider)
                 │
                 ▼
       [ FastAPI + Uvicorn ] (Port 8000)
    ┌────────────┬────────────────────────────┐
    │            │                            │
    ▼            ▼                            ▼
[ / (SPA) ]  [ /api/... ]            [ /report/{id} ]
React Build  FastAPI REST Endpoints   Public Clinical Dossier
(dist/)      ├─ Tier 1: XGBoost/SHAP
             ├─ Tier 2: Retinal ONNX
             └─ Tier 3: Doctor Report
                         │
                         ▼
        [ SQLite Persistent Volume / Supabase Postgres ]
               (database/visionxai.db)
```

---

## 🚀 Option 1: Docker / Docker Compose (Recommended)

This runs the entire system (Frontend + Backend + AI Models + Persistent Database) in an isolated container with a single command.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed (Docker Desktop on Windows/macOS, or Docker Engine on Linux)
- [Docker Compose](https://docs.docker.com/compose/) v2+

### 1. Build and Start
From the project root directory:
```bash
docker compose up -d --build
```

### 2. Verify Deployment
- Open your browser at **`http://localhost:8000`**
- Check API health: **`http://localhost:8000/api/health`**
- Interactive Swagger docs: **`http://localhost:8000/docs`**

### 3. Manage the Container
```bash
# View live logs
docker compose logs -f

# Stop the container (database is safely stored in volume 'visionxai_db_data')
docker compose down

# Restart the container
docker compose up -d
```

---

## 🌐 Option 2: Render.com (1-Click Cloud Deployment)

Render provides free/low-cost container hosting with persistent disks and automatic SSL/HTTPS certificates.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Sign in to [Render.com](https://render.com/).
3. Click **New +** ➔ **Blueprint**.
4. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml).
5. Render will provision:
   - Web Service running the multi-stage Dockerfile
   - 1 GB persistent disk mounted at `/app/database` for `visionxai.db`
   - Public HTTPS URL (e.g. `https://visionxai.onrender.com`)

---

## 🚂 Option 3: Railway.app Deployment

1. Sign in to [Railway.app](https://railway.app/).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select this repository. Railway will detect [`railway.json`](./railway.json) and [`Dockerfile`](./Dockerfile).
4. Add a **Volume** in Railway settings:
   - Mount path: `/app/database`
5. Click **Generate Domain** in the service settings to get your live URL (e.g., `https://visionxai.up.railway.app`).

---

## ⚡ Option 4: Split Hosting (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on **Vercel** or **Netlify** (CDN edge network) and the Python backend on **Render** or **Railway**:

### Step A: Deploy Backend (Render / Railway)
1. Deploy the backend using the Dockerfile on Render or Railway.
2. Note your backend URL: `https://visionxai-api.onrender.com`.

### Step B: Deploy Frontend (Vercel)
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://visionxai-api.onrender.com` (your backend URL, without trailing slash)
4. [`vercel.json`](./vercel.json) is already included to handle Single-Page Application (SPA) client-side routes.
5. Deploy!

### Netlify Alternative:
- [`netlify.toml`](./netlify.toml) is already configured. Connect your repo in Netlify, set `VITE_API_URL`, and deploy.

---

## 🖥️ Option 5: Linux Ubuntu VPS (DigitalOcean / AWS EC2 / Linode)

For self-hosting on an Ubuntu 22.04 / 24.04 server with Nginx and Systemd:

### 1. Server Setup
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv git nginx libgomp1 libgl1 curl
```

### 2. Clone and Setup Environment
```bash
git clone <your-repo-url> /var/www/visionxai
cd /var/www/visionxai

# Install Node and build frontend
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install
npm run build

# Python Virtual Environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 3. Create Systemd Service
Create `/etc/systemd/system/visionxai.service`:
```ini
[Unit]
Description=VisionXAI Tele-Ophthalmology Screening Platform
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/visionxai
Environment="PATH=/var/www/visionxai/venv/bin"
Environment="PORT=8000"
Environment="DATABASE_PATH=/var/www/visionxai/database/visionxai.db"
ExecStart=/var/www/visionxai/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable visionxai
sudo systemctl start visionxai
```

### 4. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/visionxai`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and install free SSL certificate with Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/visionxai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🗄️ Database Management & Supabase Sync

### SQLite (Default)
- Database path: `database/visionxai.db` (configurable via `DATABASE_PATH`).
- All tables, medical registries (500 records), and seed accounts are initialized automatically on startup.
- **Backup Command**:
  ```bash
  sqlite3 database/visionxai.db ".backup database/backup_$(date +%Y%m%d).db"
  ```

### Supabase (Cloud PostgreSQL Alternative)
If you wish to switch from local SQLite to managed Supabase PostgreSQL:
1. Create a project at [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase dashboard.
3. Open and run the included [`database/schema.sql`](./database/schema.sql) file.
4. Set frontend environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## ⚙️ Environment Variables Summary

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | HTTP listening port for FastAPI / Uvicorn |
| `DATABASE_PATH` | `database/visionxai.db` | Path to persistent SQLite clinical database file |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated or `*`) |
| `VITE_API_URL` | `""` (empty) | Base URL for backend API; leave empty if served together |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL for cloud database sync |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase public anonymous API key |

---

## 🧪 Production Verification Checklist

- [ ] Frontend loads with no console errors (`http://<host>`)
- [ ] Health check endpoint responds: `GET /api/health` ➔ `{"status": "healthy"}`
- [ ] API status endpoint responds: `GET /api` ➔ lists loaded AI models
- [ ] ASHA Worker login works (`ASH-MH-102` / `Asha2026!`)
- [ ] Nurse login works (`RN-MH-9024` / `Nurse2026!`)
- [ ] Doctor login works (`MCI-REG-44912` / `Doctor2026!`)
- [ ] Uploading a fundus image processes with EfficientNet ONNX and saves to database
- [ ] Doctor can generate, sign, and view public HTML medical report (`/report/{patient_id}`)
- [ ] Database volume persists data after container restart (`docker compose restart`)
