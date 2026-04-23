# 🚌 BusLine — Live Bus Schedule

A real-time bus schedule tracker for the **Inoli ↔ Mangalore** route, built with React + Vite.

## ✨ Features

- **Live Next Bus** — shows the current or upcoming bus with real-time countdown
- **Smart Stop Finder** — pick your stop and get exact arrival time
- **Full Schedule** — complete day schedule for all buses and trips
- **Multi-trip support** — tracks buses that run multiple trips per day
- **Bilingual** — full English and ಕನ್ನಡ (Kannada) support
- **Live clock** — updates every second
- **Auto-refresh** — schedule refreshes every 60 seconds
- **Mobile friendly** — responsive design with bottom navigation

## 🚏 Route

Covers 17 stops from **Inoli** to **Mangalore (State Bank)**:

> Inoli → Malar → Gramachavadi → Konaje → Assaigoli → Natekal → Deralakatte → Yenepoya → Kuttar → Thokottu → Kallapu → Jappu → Pumpwell → Kankanady → Jyoti → Hampanakatte → State Bank

## 🚌 Buses

| Bus | Trips per day |
|---|---|
| Durga Ganesh | 3 |
| Karavali | 4 |
| Akshaya | 2 |
| Sarvani | 2 |
| Sri Kateel | 3 |
| Kalarahalli | 3 |

## 🛠️ Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- CSS (custom, no UI library)
- Google Fonts — Syne + Space Mono

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📦 Deploy

```bash
npm run deploy
```

Deploys to GitHub Pages at `https://mfaizalf72.github.io/BusLine/`

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── DirectionTabs.jsx
│   ├── NextBusCard.jsx
│   ├── StopFinder.jsx
│   ├── ScheduleTable.jsx
│   └── BottomNav.jsx
├── data/
│   ├── busData.js        ← all bus schedules
│   └── translations.js   ← English + Kannada strings
├── utils/
│   ├── timeUtils.js      ← time formatting helpers
│   └── tripLogic.js      ← bus status logic
├── App.jsx
└── index.css
```

## 📄 License

MIT — free to use and modify.
