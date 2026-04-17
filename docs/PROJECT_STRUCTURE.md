# ShareSpace Project Structure

This workspace is organized around the services that actually run the app.

## Runtime folders

- `src/` - React/Vite frontend source.
- `public/` - public frontend assets served by Vite, including `applogo.png`.
- `backend/` - Spring Boot backend API and database layer.
- `cv-service/` - Python/OpenCV parking spot measurement service.
- `scripts/` - local helper scripts, such as `run-backend.ps1`.
- `tools/` - local developer tools kept outside the runtime source tree.

## Config files kept at the root

- `package.json` and `package-lock.json` - frontend dependencies and root scripts.
- `vite.config.js` - Vite frontend config.
- `index.html` - Vite HTML entrypoint.
- `.mvn/maven.config` - points root Maven commands at `backend/pom.xml`.
- `.env.example` - sample environment values.

## Documentation

- `docs/backend/` - backend feature documentation.
- `docs/cv-service/` - OpenCV service documentation.
- `docs/*.docx` and `docs/*.md` - reference docs and reports.

## Deletable cleanup area

The `deletable/` folder contains files that are not required for the current app to run. Review it, then delete it when you are comfortable.

