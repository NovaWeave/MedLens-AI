# MedLens AI Frontend (React + Vite + Tailwind)

## Scripts
```bash
npm run dev       # start vite dev server
npm run build     # production build
npm run preview   # preview production
```

## Env
- `VITE_API_BASE` (default http://localhost:8000/api)

## Tech
- React + TypeScript
- Tailwind CSS (dark mode via class)
- Framer Motion, Lucide Icons, React Hot Toast

## Structure
- `src/App.tsx` – main app and pages (Dashboard, Symptoms, Misinfo, Resources, History, Emergency, Settings)
- `src/components/*` – UI components

## Notes
- UI localized for Indian region (resources, emergency numbers, date format `en-IN`).
- Responsive design with improved alignment for Symptoms and Misinfo.
