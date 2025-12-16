# Node.js Backend

Express-based backend for the 2FA demo. Provides login, 2FA verification, resend, and a protected `me` route.

## Environment Variables (.env)

Required:
- JWT_SECRET: Secret key for signing/verifying JWTs
- BACKEND_PORT: Port for backend server (default 7006)

Optional:
- NG_APP_FRONTEND_URL: Frontend origin allowed by CORS (e.g., http://localhost:3000)
- FRONTEND_URL: Legacy alias for frontend origin
- NG_APP_TRUST_PROXY: "true" to enable trust proxy when behind proxies
- NG_APP_LOG_LEVEL: Morgan format (default: dev)
- NG_APP_HEALTHCHECK_PATH: Health endpoint path (default: /healthz)
- RATE_LIMIT_POINTS: Max requests (default: 100)
- RATE_LIMIT_DURATION: Window duration in seconds (default: 60)

Example `.env`:
```
JWT_SECRET=change-me
BACKEND_PORT=7006
NG_APP_FRONTEND_URL=http://localhost:3000
NG_APP_LOG_LEVEL=dev
NG_APP_HEALTHCHECK_PATH=/healthz
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
```

## Install & Run

```bash
npm install
npm run dev
# or production:
npm run build
npm start
```

## Endpoints

- POST /auth/login { email, password } -> { requires2fa, challengeId } or { token }
- POST /auth/2fa/verify { challengeId, code } -> { token }
- POST /auth/2fa/resend { challengeId } -> { ok: true }
- GET /auth/me (Authorization: Bearer <token>) -> { id, email }

Demo credentials:
- Email: user@example.com
- Password: password123
- 2FA code: 123456 (5 min expiry)
