🔹 Frontend

Framework: Next.js 13+ (React-based)

Using the App Router (src/app) for nested layouts and server components.

File-based routing.

Built-in server-side rendering (SSR) and client-side hydration.

Language: TypeScript

Provides type safety and better IntelliJ integration.

Styling: Tailwind CSS

Utility-first CSS for fast, consistent styling.

Works with IntelliJ Tailwind plugin for autocomplete.

Linting / Formatting:

ESLint (with next/core-web-vitals + TypeScript plugin)

Prettier for code formatting

Import Aliases:

@/* → src/

Optional secondary aliases: @components/*, @lib/*, @styles/*

🔹 Backend

API Routes: Built-in Next.js serverless functions under src/app/api/

Handles requests like task creation, habit tracking, and calendar integrations.

Database: Prisma ORM

Connects to your database (PostgreSQL, MySQL, or SQLite for dev).

Provides type-safe queries and migrations.

Database GUI Options:

Prisma Studio (built-in GUI)

Supabase dashboard if using Supabase backend

🔹 Hosting / Deployment

Hosting: Vercel (free tier works for 2–3 users)

Auto-deploys from GitHub.

Supports serverless functions and Edge runtime.

Bundler / Dev Server: Turbopack (experimental, faster than Webpack)

🔹 Development Environment

IDE: IntelliJ Ultimate

Node.js integration for running dev server.

ESLint + Prettier + Tailwind plugins.

TypeScript support.

Node.js & npm:

Node installed globally, npm updated to latest stable version.