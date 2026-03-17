# MedFlow (Fullstack: React + Node + MongoDB)

A real, deployable fullstack hospital management demo:

- **Frontend**: Vite + React + shadcn/ui
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT (email/password)
- **Reports**: File upload + “See report” works end-to-end
- **Telemedicine**: In-app WebRTC video call with Socket.IO signaling

## Local setup

### Requirements

- Node.js 18+ (recommended)
- MongoDB running locally **or** MongoDB Atlas connection string

### Install

```bash
npm install
npm install --prefix server
```

### Backend env

Copy and edit:

```bash
copy server\\.env.example server\\.env
```

Set at least:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` (default is `http://localhost:8080`)

### Seed sample data

```bash
npm run seed --prefix server
```

**Demo credentials**

- **Admin**: `admin@medflow.dev`
- **Doctor**: `doctor1@medflow.dev`
- **Patient**: `patient1@medflow.dev`
- **Password for all demo users**: `Password123!`

### Run full stack

```bash
npm run dev:full
```

Open:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:8787/health`

## Notes

- Frontend API base URL is controlled by `VITE_API_URL` in `.env` (defaults to `http://localhost:8787`).
- Uploaded reports are stored in `server/uploads/` for local development.

