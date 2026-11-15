# Ergawan Curative Clinic

Website and clinic portal source code for [Ergawan Curative Clinic](https://ergawan-care-link.base44.app).

## Project

- Frontend: React 19, TanStack Start, Vite, Tailwind CSS
- Backend and hosting: Base44
- Languages: English, Dari (Farsi), and Pashto
- Includes public clinic pages, appointment booking, service information, contact forms, patient portal, and admin tools.

## Run locally

This project uses Base44 for its backend services. To run the full application locally, install the dependencies and connect it to the original Base44 app using an authorized Base44 account:

```bash
npm install
npx base44 login
npx base44 link
npx base44 dev
```

Build:

```bash
npm run build
```

## Important

This repository contains application source code. It does not contain patient records, uploaded private files, or Base44 environment secrets. Backend functionality depends on the original Base44 app and its configured data models, functions, and secrets.

Never commit `.env` files, access tokens, patient data, or other credentials.