# Daily Smart Assistant

A voice-powered AI planning application built with Next.js, Supabase, and Groq-powered task generation. The app helps users describe their day, choose a mood, generate a realistic schedule, and track tasks through reminders, completion, and rescheduling.

## Overview

Daily Smart Assistant combines:

- Voice input for planning your day
- AI-generated schedules based on user goals and mood
- Productivity metrics and progress tracking
- A calendar-style timeline for scheduled tasks
- Reminder and rescheduling flows for missed items

The current UI is centered around a single-page experience in [app/page.tsx](app/page.tsx), with supporting API routes that manage planning, retrieval, completion, and rescheduling.

## Key Features

- Mood-aware planning with the [MoodCheck](app/components/MoodCheck.tsx) component
- Speech-to-text input using browser speech recognition APIs
- Text-to-speech reminders using browser speech synthesis APIs
- AI-generated daily schedules through the planning endpoint
- Task dashboard with productivity score, completed count, and pending count
- Calendar visualization powered by react-big-calendar
- Quick actions to complete or reschedule tasks

## Tech Stack

- [Next.js 15](https://nextjs.org/) for the app framework
- [React 19](https://react.dev/) for UI components
- [TypeScript](https://www.typescriptlang.org/) for static typing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for persistence and data storage
- [Groq / OpenAI-compatible API](https://console.groq.com/) for AI-generated scheduling
- [lucide-react](https://lucide.dev/) for icons
- [react-big-calendar](https://www.npmjs.com/package/react-big-calendar) for calendar display

## Project Structure

- [app/page.tsx](app/page.tsx) — main planner interface and orchestration logic
- [app/layout.tsx](app/layout.tsx) — root layout and app metadata
- [app/components/](app/components) — reusable UI components
  - [app/components/MoodCheck.tsx](app/components/MoodCheck.tsx) — mood selection panel
  - [app/components/Dashboard.tsx](app/components/Dashboard.tsx) — performance summary cards
  - [app/components/CalendarView.tsx](app/components/CalendarView.tsx) — calendar display for tasks
- [app/api/plan/route.ts](app/api/plan/route.ts) — creates a schedule from raw user input using AI
- [app/api/tasks/route.ts](app/api/tasks/route.ts) — fetches the latest planned tasks with stats
- [app/api/complete/route.ts](app/api/complete/route.ts) — marks a task as completed
- [app/api/reschedule/route.ts](app/api/reschedule/route.ts) — reschedules a missed task with AI suggestions
- [databse_setup.sql](databse_setup.sql) — database schema definitions for the app data model
- [package.json](package.json) — scripts and dependencies

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18 or newer
- npm, pnpm, or yarn
- A Supabase project with a configured Postgres database
- A Groq API key (or another OpenAI-compatible API key compatible with the configured base URL)

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` is used by the app to connect to the Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` is used by server-side API routes for database writes.
- `GROQ_API_KEY` is used to call the Groq chat API with the configured base URL in [app/api/plan/route.ts](app/api/plan/route.ts) and [app/api/reschedule/route.ts](app/api/reschedule/route.ts).

## Database Setup

This project expects the following data model:

- `user_plans`
  - Stores a user plan record with `user_id` and `raw_input`
- `planned_tasks`
  - Stores scheduled tasks with fields such as `plan_id`, `user_id`, `task_title`, `execution_time`, `priority`, `voice_reminder_text`, and `status`

Use [databse_setup.sql](databse_setup.sql) as the starting point for your database schema and then create the related tables in Supabase before running the app.

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Production Build

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` — starts the local Next.js development server
- `npm run build` — produces a production build
- `npm run start` — serves the production build locally
- `npm run lint` — runs the linter for the project

## API Flow Summary

1. The user enters a plan description and selects a mood in the main interface.
2. The client sends the input to [app/api/plan/route.ts](app/api/plan/route.ts).
3. The API writes the raw plan to Supabase and asks the AI model to generate a structured schedule in JSON.
4. The returned tasks are inserted into the `planned_tasks` table.
5. The client fetches tasks from [app/api/tasks/route.ts](app/api/tasks/route.ts) and renders the timeline, dashboard, and calendar view.
6. Users can complete a task with [app/api/complete/route.ts](app/api/complete/route.ts) or reschedule a missed task with [app/api/reschedule/route.ts](app/api/reschedule/route.ts).

## Deployment Notes

This project is ready to be deployed on any platform that supports Next.js applications, including:

- Vercel
- Netlify
- Railway
- Render

Before deploying, ensure that all required environment variables are configured in the hosting platform settings.

## Notes for Usage

- Speech recognition and speech synthesis rely on browser support and may behave differently by device and browser.
- Notification permissions may be requested on first load for reminders.
- The current app uses a demo user ID (`demo-user-123`) in the planning flow, so you may want to replace this with a real authenticated user identifier for production.

## License

This project is currently unlicensed unless you add a specific license file.

