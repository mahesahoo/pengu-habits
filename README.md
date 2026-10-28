# 🐧 Pengu — soft habit buddy

A cozy little habit tracker with a softgirl aesthetic. Built as a lightweight, installable web app (PWA) that works offline and keeps everything private on the device.

## ✨ Features

- Cute pastel themes (blush, lavender, peach, mint) + a floating penguin mascot
- One-tap daily check-ins with haptic feedback and confetti
- Automatic streak tracking with celebrations at 7 / 30 / 100 / 365 days
- Monthly calendar, weekly dots, and a little stats recap
- Gentle reminders and "don't forget" nudges
- Fully offline & installable ("Add to Home screen")
- Private by design — all data stays in the browser's local storage
- JSON backup / restore
- Auto-updates when a new version is pushed

## 🚀 Run locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## 🌐 Deploy

It's a fully static site — works on GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.

## 🛠 Tech

Vanilla HTML/CSS/JS, zero dependencies. A service worker handles offline caching and automatic updates.
