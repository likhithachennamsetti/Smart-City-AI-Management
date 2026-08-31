# Deployment preparation notes

## Current project state

- Frontend: HTML/CSS/JavaScript in `frontend/`.
- Backend: FastAPI in `backend/`.
- Database: PostgreSQL.
- Authentication: JWT + bcrypt.
- Email notifications: SMTP/Gmail configuration through environment variables.
- AI code is present under `ai/`, but the current public deployment should be treated separately from the core complaint workflow because AI models are loaded at application startup.

## Important before GitHub

The original project archive contained `backend/.env`, a Python virtual environment, and Python cache files. The deployment copy removes the `.env`, `venv/`, `__pycache__/`, and `.pyc` files. Never commit the real `.env`.

If the original `.env` has ever been shared publicly, rotate the database password, JWT secret, and email app password.

## Recommended deployment architecture

- GitHub: source repository
- Render: FastAPI backend
- Render Static Site: frontend
- PostgreSQL: managed database (Render Postgres or another PostgreSQL provider)

## Environment variables

Set these in the backend hosting service instead of committing them:

```text
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
DB_NAME=...
SECRET_KEY=...
EMAIL_ADDRESS=...
EMAIL_PASSWORD=...
```

## Frontend

Before publishing the frontend, replace the local API URL in `frontend/script.js`:

```javascript
const API_URL = "http://127.0.0.1:8000";
```

with the HTTPS URL of the deployed FastAPI service.

## Current AI deployment caution

`backend/main.py` imports AI routers, and those routers instantiate YOLO/CLIP models during startup. This can make a small/free deployment slow or exceed available memory. The manual complaint workflow does not depend on this AI startup path. For the first public deployment, keep the core complaint system stable and deploy AI separately/after the core service is verified.
