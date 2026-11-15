# Project Guide

## Project

Ergawan Curative Clinic is a React 19 application built with TanStack Start, Vite, and Tailwind CSS. It includes public clinic pages, appointment booking, service information, contact forms, patient portal, and administration tools.

## Key Files

- `src/routes/__root.jsx`: shared HTML document, providers, and app shell.
- `src/routes/*.jsx`: file-based application routes.
- `src/lib/server-fns.js`: server functions.
- `src/start.js`: request and function middleware.
- `src/server.js`: server entry point.
- `src/components/ui/`: shared UI components.
- `src/index.css` and `tailwind.config.js`: design tokens and styles.
- `wrangler.jsonc`: Cloudflare Worker configuration.

## Security

- Treat every server function and server route as a public HTTP endpoint.
- Validate all inputs on the server.
- Require authentication and authorization for private patient and staff data.
- Check record ownership and role permissions before reading or changing records.
- Never expose credentials, access tokens, or private request headers.
- Do not commit patient records, private uploads, environment files, or credentials.
- Keep secrets in secure server-side environment configuration.

## Development

Install dependencies with `npm install`, run locally with `npm run dev`, and create a production build with `npm run build`. Run `npm run lint` before submitting code changes.

Preserve existing clinic functionality and patient-data protections when changing the application. Do not replace authentication, database, appointment, or patient-portal services without implementing and testing an equivalent replacement.
