# Deployment (Vercel frontend + Render backend)

## 1) Backend (Render)

### Create the service
- Render dashboard → **New** → **Web Service**
- Connect your GitHub repo
- **Root Directory**: `backend`
- **Environment**: Node

### Build / Start
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

### Environment variables (Render)
Set these in Render → Service → **Environment**:
- `NODE_ENV=production`
- `PORT=5000` (Render will also set its own PORT; the app already reads `PORT`)
- `BASE_PATH=/api`
- `MONGO_URI=...` (MongoDB Atlas connection string)
- `SESSION_SECRET=...` (long random string)
- `SESSION_EXPIRES_IN=1d` (optional)
- `FRONTEND_ORIGIN=https://<your-vercel-domain>`
- `FRONTEND_GOOGLE_CALLBACK_URL=https://<your-vercel-domain>/google/callback`
- `GOOGLE_CLIENT_ID=...` (optional if using Google login)
- `GOOGLE_CLIENT_SECRET=...`
- `GOOGLE_CALLBACK_URL=https://<your-render-domain>/api/auth/google/callback`

### MongoDB Atlas notes
- Ensure Atlas **Network Access** allows Render to connect.
  - Quick dev option: allow `0.0.0.0/0` (not recommended for strict security).
  - Better: allow only your deployment egress IPs (Render may change these depending on plan/region).

### Verify
- After deploy, open: `https://<render-domain>/api` (should respond, even if it returns a controlled error).


## 2) Frontend (Vercel)

### Create the project
- Vercel dashboard → **Add New** → **Project**
- Import your GitHub repo
- **Root Directory**: `client`

### Build
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

### Environment variables (Vercel)
- `VITE_API_BASE_URL=https://<your-render-domain>/api`

### Verify
- Visit `https://<your-vercel-domain>`
- Register/Login should set a `session` cookie and then `/api/user/current` should return 200.


## 3) Common gotchas
- Cross-domain cookies require HTTPS + `SameSite=None; Secure` in production (already configured in backend).
- If you use React Router, refreshing on nested routes can 404 unless Vercel rewrites to `index.html`.
