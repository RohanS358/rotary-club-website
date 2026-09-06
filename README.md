<img src="./public/wheel.png" width="72" alt="Rotary International emblem" />

# Rotary Club Website

A full-featured website and lightweight CMS for a Rotary Club chapter — public-facing pages plus an admin dashboard for the club to manage its own content.

**Live:** [rotary-steel.vercel.app](https://rotary-steel.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-000000?style=flat-square&logo=three.js&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat-square&logo=radixui&logoColor=white)

## Overview

The site covers everything a club needs on the public side — mission, leadership messages, board members, ongoing and featured projects, a trophies/achievements section, testimonials, a news and publications calendar, and a photo gallery — backed by Supabase so content is data-driven rather than hardcoded.

## Features

- **Public site**: home, about, projects, gallery, archives, publications, member directory, contact
- **Admin dashboard**: content management for projects, news, members, and a treasury module for tracking club finances
- **Dynamic homepage**: latest project, live stats counters, leadership messages, and testimonials pulled from Supabase at request time
- **Calendar**: combined news/publications calendar view
- **3D/interactive elements** via React Three Fiber + drei

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database/Auth**: Supabase
- **UI**: Radix UI primitives, custom component library
- **3D**: React Three Fiber, drei

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a Supabase project — copy `.env.example` (if present) to `.env.local` and set your Supabase URL and anon key before the data-driven sections will populate.
