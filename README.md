# DevOps Project - Todo API

A beginner-friendly DevOps project demonstrating CI/CD pipelines with Docker, PostgreSQL, NGINX, and GitHub Actions.

## Tech Stack

- **Language**: Python 3.13
- **Framework**: Flask
- **Database**: PostgreSQL 16
- **Reverse Proxy**: NGINX
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
├─────────────────────────────────────────────────────────────┤
│   Push Code → GitHub Actions → Build → Test → Push Image    │
│                              │                              │
│                              ▼                              │
│   ┌──────────────────────────────────────────────────┐     │
│   │              Docker Compose                       │     │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │     │
│   │  │  NGINX  │  │  Flask  │  │Postgres │          │     │
│   │  │(Proxy)  │─▶│   API   │─▶│        │          │     │
│   │  └─────────┘  └─────────┘  └─────────┘          │     │
│   └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints 

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/todos | List all todos |
| POST | /api/todos | Create a todo |
| PUT | /api/todos/{id} | Update a todo |
| DELETE | /api/todos/{id} | Delete a todo |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.13+ (for local development)

### Run with Docker Compose

```bash
docker compose up -d
```

### Run Locally

```bash
cd app
pip install -r requirements.txt
python app.py
```

### Access the API

- API: http://localhost/api/todos
- Health: http://localhost/api/health

## GitHub Actions CI/CD Pipeline

The pipeline runs on every push and includes:

1. **Lint** - Code quality checks (flake8, black)
2. **Test** - Unit tests with PostgreSQL service
3. **Build** - Docker image build and push to registry
4. **Deploy** - SSH deployment to server (optional)

### Required Secrets

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_TOKEN` - Docker Hub access token
- `SERVER_SSH_KEY` - SSH private key for deployment
- `SERVER_KNOWN_HOSTS` - Known hosts for SSH

## Project Structure

```
todo-api/
├── app/
│   ├── app.py           # Flask application
│   ├── Dockerfile       # Multi-stage build
│   └── requirements.txt
├── db/
│   └── init.sql         # Database schema
├── nginx/
│   └── nginx.conf       # NGINX configuration
├── docker-compose.yml   # Production compose
└── .github/
    └── workflows/
        └── ci-cd.yml   # CI/CD pipeline
```
