# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Development server

Recommended local development uses the proxy:
- proxy.conf.json forwards `/auth` to `http://localhost:7006`.
- Leave `NG_APP_API_BASE` empty so HTTP calls use relative `/auth/...`.

To start a local development server, run:

```bash
npm start
```

Once running, open `http://localhost:3000/`. The app reloads on source changes.

If you prefer direct CORS without proxy:
- Set `window.NG_APP_API_BASE = "http://localhost:7006"` in `src/index.html`.
- Ensure backend CORS allows `http://localhost:3000` via `NG_APP_FRONTEND_URL`.

## Building

To build the project run:

```bash
ng build
```

Artifacts will be in `dist/`.

## Running unit tests

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
