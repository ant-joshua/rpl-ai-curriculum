# Express API Starter

```bash
npx degit rpl-ai-curriculum/templates/express-api my-api
cd my-api
npm install
npm run dev
```

## Structure

```
src/
  index.ts        # Entry point
  app.ts          # Express app
  routes/
  middleware/
  types/
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/items | List items |
| POST | /api/items | Create item |

## Commands

```bash
npm run dev    # Hot reload
npm run build  # Compile TS
npm start      # Run production
npm run lint   # Lint
```
