# Online Grocery Store Frontend (Vite + React)

## Environment Variables

Create a `.env` file (never commit it) alongside this README and add:

```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

During local development this value can be omitted because the Vite dev server proxies `/api` calls to `http://localhost:3000`. For production builds (Vercel, Netlify, etc.) you must point to the deployed backend URL so that Axios calls reach the correct server.

## Local Development

```bash
pnpm install   # or npm install / yarn
pnpm dev       # served at http://localhost:5175
```

Ensure the backend is running locally on port 3000 so the Vite proxy can forward `/api` calls.

## Building for Production

```bash
pnpm build     # outputs static assets in dist/
pnpm preview   # optional local preview
```

The `dist` folder can be deployed on Vercel using the “Vite” framework preset. Point the backend URL in `.env` to your deployed API before triggering a production build.*** End Patch
