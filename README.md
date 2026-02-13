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

## Nginx + Varnish (h.tools)

This project includes:
- Front Nginx on `80/443` -> Varnish `127.0.0.1:6081`
- Back Nginx on `127.0.0.1:8080` -> Nuxt app `127.0.0.1:3020`

Use `deploy/nginx/h.tools.conf` and enable it:

```bash
sudo cp deploy/nginx/h.tools.conf /etc/nginx/sites-available/h.tools.conf
sudo ln -s /etc/nginx/sites-available/h.tools.conf /etc/nginx/sites-enabled/h.tools.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```
