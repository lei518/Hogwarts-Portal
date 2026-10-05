# Hogwarts Portal

The official Hogwarts School of Witchcraft and Wizardry Digital Portal — a Canvas LMS-style student information system, reimagined for the Wizarding World.

Students sign in to manage their profile, check grades, view their class schedule, submit assignments, and read announcements — except their "LMS" is a magical school, their inbox is Owl Post, and their electives are Charms and Potions instead of Calculus and Chemistry. Every feature is designed to answer one question first: *"What would a Hogwarts student realistically expect to find on their school's online portal?"* — with the magic layered on top of that, not replacing it.

## Features

**Academics**
- Course catalog, class schedule, and assignments
- Grades and an official academic transcript
- Academic calendar

**Campus Life**
- Owlery (Owl Post messaging)
- Interactive campus map
- Common Room, House pages, and House points
- Achievements and student character profile

**Student Services**
- Library (book catalog and library services)
- Hospital Wing and Healer services
- Hogsmeade services and the Hogwarts Express
- Lost and Found, school policies, and general student support

**Onboarding & Identity**
- Admin-provisioned accounts (no self-serve sign-up) with role- and year-based access
- Year 1 students: Wand Ceremony and Sorting Hat placement
- Year 5 students: a one-time Patronus Charm milestone

**Role-based Portals**
- Dedicated views for Students, Professors, Librarians, the Caretaker, the Healer, the Deputy Headmaster, and Admins

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and bundling
- [React Router](https://reactrouter.com/) for client-side routing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for auth and the database
- [Lucide](https://lucide.dev/) for icons
- [Oxlint](https://oxc.rs/) for linting

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and data)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

Outputs a production build to `dist/`.

### Lint

```bash
npm run lint
```

## Deployment

This project deploys cleanly to [Vercel](https://vercel.com) as a static Vite build. Set the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your Vercel project settings, and add a `vercel.json` rewrite so client-side routes resolve correctly on refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Disclaimer

This is a fan-made, non-commercial project inspired by the Harry Potter universe created by J.K. Rowling. It is not affiliated with or endorsed by Warner Bros., J.K. Rowling, or any official Harry Potter franchise entity.