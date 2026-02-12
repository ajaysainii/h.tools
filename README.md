# Heartbeat Text Converter (Standalone)

Standalone Nuxt app for text conversion.

## Features

- Case converter as homepage (`/`)
- Google login (Firebase popup)
- Header + footer styled like Heartbeat Tools
- No menu/navigation blocks
- Dark/light theme toggle

## Setup

1. Copy environment template:

```bash
cp .env.example .env
```

2. Fill Firebase values in `.env`.

3. Install dependencies:

```bash
npm install
```

4. Start dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## PM2 Deploy (Port 3020)

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

## Nginx Reverse Proxy

1. Update `server_name` in `deploy/nginx/heartbeat-text-converter.conf`.
2. Copy and enable the site:

```bash
sudo cp deploy/nginx/heartbeat-text-converter.conf /etc/nginx/sites-available/heartbeat-text-converter.conf
sudo ln -s /etc/nginx/sites-available/heartbeat-text-converter.conf /etc/nginx/sites-enabled/heartbeat-text-converter.conf
sudo nginx -t
sudo systemctl reload nginx
```
