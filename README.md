# two-factor-authentication-platform-7006-7015

A multi-container project providing a 2FA demo:
- Angular frontend (login → 2FA code → protected dashboard)
- Node.js backend (Express + JWT + in-memory DB)

This README documents environment variables, local run instructions, and integration details.

## Containers

- Frontend: two-factor-authentication-platform-7006-7015/angular_frontend
- Backend: two-factor-authentication-platform-7006-7015/nodejs_backend

## Environment Variables

Create separate .env files for each container (do not commit secrets).

### Angular Frontend (.env at angular_frontend if using build-time env injection)

- NG_APP_API_BASE: Base URL of backend API.
  - Example for direct CORS: https://localhost:7006
  - Example for dev proxy usage: leave empty to use relative /auth
- NG_APP_FRONTEND_URL: Public origin of frontend (optional; helpful for backend CORS docs).
  - Example: http://localhost:3000
- NG_APP_NODE_ENV, NG_APP_NEXT_TELEMETRY_DISABLED, NG_APP_ENABLE_SOURCE_MAPS, NG_APP_PORT, NG_APP_TRUST_PROXY, NG_APP_LOG_LEVEL, NG_APP_HEALTHCHECK_PATH, NG_APP_FEATURE_FLAGS, NG_APP_EXPERIMENTS_ENABLED: Optional feature flags/telemetry fields (not required for this demo).

Note: The Angular app reads NG_APP_API_BASE via:
- window.NG_APP_API_BASE at runtime (configured in index.html or by injecting a script)
- process.env.NG_APP_API_BASE during SSR/build

If NG_APP_API_BASE is empty, the app uses relative paths (e.g., /auth/login) and relies on the dev proxy.

### Node.js Backend (.env at nodejs_backend)

Required:
- JWT_SECRET: Secret key for signing/verifying JWTs
- BACKEND_PORT: Port for backend server (default 7006)

Optional:
- NG_APP_FRONTEND_URL: Frontend origin allowed by CORS (e.g., http://localhost:3000)
- FRONTEND_URL: Alternative env name to allow legacy support
- NG_APP_TRUST_PROXY: "true" to enable trust proxy when running behind reverse proxies
- NG_APP_LOG_LEVEL: Morgan log format (default: dev)
- NG_APP_HEALTHCHECK_PATH: Health endpoint path (default: /healthz)
- RATE_LIMIT_POINTS: Max requests within a window (default: 100)
- RATE_LIMIT_DURATION: Window duration in seconds (default: 60)

## Development Options

You can choose one of two dev flows.

### Option A: Use Angular Dev Proxy (recommended)

- Set NG_APP_API_BASE empty (or do not set it) on the frontend.
- Proxy is configured in angular_frontend/proxy.conf.json to forward /auth/* to http://localhost:7006.

Steps:
1) Backend
   - cd nodejs_backend
   - Create .env:
     - JWT_SECRET=change-me
     - BACKEND_PORT=7006
     - NG_APP_FRONTEND_URL=http://localhost:3000
   - npm install
   - npm run dev

2) Frontend
   - cd angular_frontend
   - Leave NG_APP_API_BASE empty (no need for a .env)
   - npm install
   - npm start
   - Open http://localhost:3000

API calls will go to /auth/... and will be proxied to the backend. No browser CORS is involved.

### Option B: Direct CORS (no proxy)

- Set NG_APP_API_BASE explicitly to the backend URL on the frontend, e.g.:
  - On the browser, inject script: window.NG_APP_API_BASE = "http://localhost:7006";
  - Or set process.env.NG_APP_API_BASE for SSR/build
- Ensure backend CORS allows the frontend origin via NG_APP_FRONTEND_URL or FRONTEND_URL.

Steps:
1) Backend
   - cd nodejs_backend
   - .env:
     - JWT_SECRET=change-me
     - BACKEND_PORT=7006
     - NG_APP_FRONTEND_URL=http://localhost:3000
   - npm install
   - npm run dev

2) Frontend
   - cd angular_frontend
   - In src/index.html, set:
     <script>window.NG_APP_API_BASE = "http://localhost:7006";</script>
   - npm install
   - npm start
   - Open http://localhost:3000

## End-to-End Flow

1) Login with demo user:
   - Email: user@example.com
   - Password: password123
2) If 2FA is required, you will be redirected to the 2FA page.
   - Demo code is 123456 (expires in 5 minutes; resend regenerates it with same value for demo).
3) On success, a JWT is saved and the Dashboard (guarded route) is accessible.

HTTP Endpoints (backend):
- POST /auth/login { email, password } -> { requires2fa, challengeId } or { token }
- POST /auth/2fa/verify { challengeId, code } -> { token }
- POST /auth/2fa/resend { challengeId } -> { ok: true }
- GET /auth/me (Authorization: Bearer <token>) -> { id, email }

## Notes

- For development, the Angular proxy is the simplest setup.
- When deploying, set NG_APP_API_BASE to your backend public URL and set NG_APP_FRONTEND_URL on the backend to your frontend origin.

## Scripts

Frontend:
- npm start (dev server on port 3000)
- npm run build

Backend:
- npm run dev (ts-node + nodemon)
- npm run build && npm start (production build/run)
