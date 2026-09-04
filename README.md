# IndiaBuddy

IndiaBuddy is a comprehensive travel cost tracker tailored for the Indian travel ecosystem. It calculates optimal travel routes, provides up-to-date pricing by scraping sources with Playwright stealth (Ghost Browser), and factors in local events and holidays.

## Architecture

```text
+-------------------+       +-----------------------+
|   Public Web      |       |    Internal Network   |
|                   |       |                       |
|   +-----------+   |       |   +---------------+   |
|   |           +----------->   |               |   |
|   |   NGINX   |   |       |   |   Frontend    |   |
|   | (80, 443) +--------------->  (Next.js)    |   |
|   |           |   |       |   |               |   |
|   +-----+-----+   |       |   +---------------+   |
|         |         |       |                       |
|         |         |       |   +---------------+   |
|         +----------------->   |               |   |
|                   |       |   |   Backend     |   |
|                   |       |   |  (FastAPI)    |   |
|                   |       |   |               |   |
+-------------------+       |   +---+-------+---+   |
                            |       |       |       |
                            |   +---v---+ +-v-----+ |
                            |   |       | |       | |
                            |   | Redis | |  DB   | |
                            |   |       | | (PG)  | |
                            |   +-------+ +-------+ |
                            |                       |
                            |   +---------------+   |
                            |   | Ghost Browser |   |
                            |   | (Playwright)  |   |
                            |   +---------------+   |
                            +-----------------------+
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js (for local frontend dev)
- Python 3.10+ (for local backend dev)

## Quick Start

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the necessary variables:
   ```bash
   cp .env.example .env
   ```
3. Spin up the infrastructure using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. The frontend will be available at `http://localhost`, and the API at `http://localhost/api/`.

## Development Setup

For local development without Docker:

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## Deployment Guide (VPS / Hetzner CX21)

1. Provision an Ubuntu 22.04 server on Hetzner (CX21 is recommended).
2. Install Docker and Docker Compose on the VPS.
3. Clone this repository to the VPS.
4. Configure the `.env` file with production values, specifically `ENVIRONMENT=production`.
5. Run `docker-compose up -d --build`.

### Domain & Cloudflare Setup

1. Point your domain's A record to the VPS IP address in Cloudflare.
2. Enable Cloudflare Proxy (Orange Cloud). Cloudflare will handle SSL termination.
3. The NGINX reverse proxy will receive traffic on port 80 and route it to the respective services. Make sure port 80 is open on your VPS firewall.

## Environment Variables

Check `.env.example` for all configurable environment variables. Ensure secure passwords are used for `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and `JWT_SECRET_KEY` in production.

## License

This project is licensed under the MIT License.
