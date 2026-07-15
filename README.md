# SOIL — Sons & Daughters of the Indigenous Land

> *A cinematic, immersive web experience celebrating Indigenous African identity, culture, and artistry.*

![SOIL](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## About This Project

SOIL is a full-stack cultural platform and e-commerce site built for a client in the African creative industry. The platform blends cinematic storytelling with a fully functional online studio — combining scroll-driven video experiences, immersive page transitions, and a live Supabase-powered shop with real payment processing.

**This repo is my personal portfolio snapshot of the project.** The original collaborative repository lives at [chibbss/SOIL-v1](https://github.com/chibbss/SOIL-v1).

---

## My Role — Frontend Developer

I joined this project as the **frontend developer**, responsible for translating the client's creative vision into performant, pixel-accurate React code. Key areas I owned:

### 🎬 Cinematic Scroll Experience (v3 Overhaul)
- Architected the **high-performance scrollytelling system** — a canvas-based frame extraction pipeline that scrubs through 360 exported video frames in sync with the user's scroll position
- Replaced the original video-element approach with a canvas decode pre-pass, eliminating hardware decoding bottlenecks and achieving consistent **60fps across all devices**
- Implemented smooth-scroll integration using **Lenis** for buttery, physics-based scrolling
- Engineered the scrollable narrative text layout with responsive typography scaling (`4xl → 6xl`)

### 🗺️ Intelligence Page
- Built the full **Intelligence page** from scratch — a high-performance, content-rich editorial layout
- Integrated interactive map layers using **React Leaflet**
- Implemented scroll-triggered section reveals and animated transitions

### 📖 Story / Cultivate Pages & Route Transitions
- Implemented the **cinematic Story page** with immersive full-bleed visuals and narrative scrolling
- Built **page-level route transitions** using Framer Motion for seamless inter-page navigation

### ✨ UI System & Visual Polish
- Implemented the **v3 complete experience overhaul** across Ecosystem, Studio, and Home — unifying visual language, spacing, and motion
- Designed and implemented the **ancient-futuristic sacred glyph system** for decorative UI elements and loading states
- Built the **magnetic cursor** and **particle background** system for immersive desktop interaction
- Redesigned and rebuilt **Navbar** and **Footer** with mobile-responsive layouts and scroll-aware behaviour
- Rebuilt the **Ecosystem section icons** (eye, paintbrush, magnifying glass, scales, columns) for visual clarity

### 🎭 Video Scrubbing (Re-implementation)
- Re-implemented the entire **video scrubbing engine** after diagnosing performance regressions in the original implementation — delivering smoother, more reliable frame playback with better font-loading synchronisation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS + custom design tokens |
| Animation | Framer Motion + Lenis smooth scroll |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Payments | Paystack (NGN + USD multi-currency) |
| Email | Resend (transactional order emails) |
| Maps | React Leaflet |
| 3D / Canvas | Three.js + React Three Fiber |
| Error Monitoring | Sentry |
| Hosting | Vercel (serverless functions + CDN) |
| State Management | Zustand + TanStack Query |

---

## Pages & Features

| Page / Feature | Description |
|---|---|
| **Home** | Cinematic hero with canvas-based scroll-driven eagle sequence (360 frames) |
| **Intelligence** | Editorial content hub with interactive map and scroll reveals |
| **Story / Cultivate** | Narrative scroll experience with immersive visuals |
| **Studio** | Full e-commerce store — collections, product modals, cart, Paystack checkout |
| **Admin Dashboard** | CMS for products, orders, site settings, and subscriber management |
| **Spotify Integration** | Embedded SOIL playlist player |
| **Contact Modal** | Multi-field contact form with Supabase submission |
| **Cookie Consent** | GDPR-style consent banner |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project



## Project Structure

```
src/
├── api/              # Vercel serverless functions (Paystack webhook, Resend)
├── components/
│   ├── home/         # Home page scroll & narrative components
│   ├── shared/       # Navbar, ContactModal, SpotifyPlayer, PageMeta...
│   ├── studio/       # Cart, ProductCard, ProductModal, StoreControls
│   ├── admin/        # CMS panels
│   ├── soil/         # Brand-specific UI components
│   └── ui/           # Radix UI primitives + shadcn/ui components
├── pages/            # Route-level page components
├── hooks/            # Custom React hooks
├── store/            # Zustand global state
├── lib/              # Supabase client, utilities
└── data/             # Static data & content
```

---

## Acknowledgements

This was a collaborative project. Original concept, design direction, and backend architecture by [chibbss](https://github.com/chibbss). I joined as frontend developer to implement the design and refine the experience.

---

*Built with intention. Rooted in culture.*
