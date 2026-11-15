# Ergawan Curative Clinic

Website and clinic portal source code for Ergawan Curative Clinic.

## Project

- Frontend: React 19, TanStack Start, Vite, and Tailwind CSS
- Languages: English, Dari (Farsi), and Pashto
- Includes public clinic pages, appointment booking, service information, contact forms, patient portal, and administration tools.

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Backend and deployment

The existing application still uses its currently configured hosted backend services. These integrations have been left in place to avoid breaking appointment booking, patient portal, administration tools, or other connected features.

Removing platform branding does not by itself migrate the backend or make the application fully independent. A separate backend replacement and configuration would be required for that.

## Security

This repository should not contain patient records, private uploads, environment files, access tokens, or other credentials. Keep all sensitive values in secure environment configuration.
