# QuickCart Inventory & Storefront

Modern MERN stack grocery inventory system with an admin dashboard plus a public-facing storefront that supports carts, supplier management, PDF reports, and interactive charts.

## Project Structure

```
online-grocery-store-inventory/
├─ online-grocery-store-frontend/     # React + Vite storefront & admin UI
└─ online-grocery-store-system-backend/
   └─ backend/server/                 # Express + MongoDB API
```

## Highlights

- Inventory dashboard with KPI cards and **Recharts** visualisations (category distribution, stock tier breakdown, total stock trend).
- Public Quickhome storefront with searching, filtering, pagination, and a persistent cart powered by React Context + localStorage.
- Supplier management including PDF exports, purchase order helper, and deletion flows.
- Product CRUD with image uploads to Cloudinary and printable inventory reports.
- Ready for deployment: backend and frontend can be deployed to **Vercel** with minimal configuration.

## Local Development

### Requirements

- Node 18+
- pnpm / npm / yarn
- MongoDB Atlas connection string (or local Mongo instance)

### Backend (`online-grocery-store-system-backend/backend/server`)

1. Install dependencies:
   ```bash
   cd online-grocery-store-system-backend/backend/server
   npm install
   ```
2. Create `.env` (never commit it):
   ```
   MONGODB_URI=your-atlas-uri
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ALLOWED_ORIGINS=http://localhost:5175
   ```
3. Start the API:
   ```bash
   npm run dev
   ```
   It listens on `http://localhost:3000`.

### Frontend (`online-grocery-store-frontend`)

1. Install dependencies:
   ```bash
   cd online-grocery-store-frontend
   npm install
   ```
2. Create `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The UI runs on `http://localhost:5175` and proxies `/api` → backend automatically.

## Deployment (Vercel)

### Backend API
1. In Vercel, create a new project and point it to `online-grocery-store-system-backend/backend/server`.
2. Framework preset: **Other**. Build command: `npm install`. Output directory: leave blank.
3. Add environment variables (`MONGODB_URI`, `CLOUDINARY_*`, `ALLOWED_ORIGINS`, etc.).
4. Deploy → Note the URL, e.g. `https://quickcart-api.vercel.app`.

### Frontend
1. Create another Vercel project targeting `online-grocery-store-frontend`.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Add `VITE_API_BASE_URL=https://quickcart-api.vercel.app/api`.
4. Deploy → The resulting URL is the public storefront/dashboard link.

## Publishing to GitHub

Inside `online-grocery-store-inventory`:
```bash
git init
git add .
git commit -m "Initial commit: QuickCart inventory system"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## Next Steps

- Add a stock-history collection if you need per-product stock timelines.
- Protect admin routes with authentication/authorization.
- Add automated tests (Jest, React Testing Library) for critical flows.

Enjoy building with QuickCart! 🚀

