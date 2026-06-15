# ⬡ VertexCollab — Enterprise SaaS Collaboration Platform

> **DevOps Academic Project** — Phase 1: Application Development  
> A Microsoft Teams / Slack-like collaboration platform built to demonstrate the full DevOps lifecycle.

---

## 📖 Project Overview

VertexCollab is a lightweight, full-stack collaboration platform that allows teams to communicate in real time through workspaces, channels, and messages. It includes task management, document sharing, and an admin dashboard — all containerized with Docker and ready for CI/CD integration.

The primary goal of this project is **not advanced app features** but to serve as a well-structured, deployable application around which DevOps tooling (Jenkins, Kubernetes, Terraform, Prometheus, Grafana, ELK Stack, Vault) can be demonstrated in future phases.

---

## 🛠️ Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 18 + Vite                   |
| Backend        | Node.js + Express                 |
| Database       | MongoDB + Mongoose                |
| Authentication | JWT (jsonwebtoken) + bcryptjs     |
| API Client     | Axios                             |
| Containerization | Docker + Docker Compose         |

---

## ✅ Features

- **User Registration & Login** with bcrypt password hashing
- **JWT-based authentication** with Bearer token on all protected routes
- **User roles**: `admin` and `member`
- **Dashboard** — greeting, quick links, system health status, and admin stats
- **Workspaces** — create, view, and delete team workspaces
- **Channels** — create channels inside a workspace; send and view messages
- **Task Board** — Kanban-style board with `todo`, `in-progress`, and `done` columns; assign tasks to users
- **Documents** — metadata-only document sharing (title, type, size); no binary file upload required
- **Admin Dashboard** — total users, workspaces, channels, messages, tasks, and documents
- **Health Check API** — `GET /health` returns app status
- **Readiness API** — `GET /ready` checks MongoDB connection

---

## 📁 Folder Structure

```
vertexcollab/
├── README.md
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Workspace.js
│   │   ├── Channel.js
│   │   ├── Message.js
│   │   ├── Task.js
│   │   └── Document.js
│   └── routes/
│       ├── auth.js
│       ├── workspaces.js
│       ├── channels.js
│       ├── messages.js
│       ├── tasks.js
│       ├── documents.js
│       └── admin.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api.js
│       ├── index.css
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Workspace.jsx
│       │   ├── Channel.jsx
│       │   ├── Tasks.jsx
│       │   ├── Documents.jsx
│       │   └── Admin.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── Sidebar.jsx
│           └── ProtectedRoute.jsx
└── k8s/
    └── placeholder.txt
```

---

## 🚀 Local Setup (Without Docker)

### Prerequisites
- Node.js v18+
- MongoDB running locally on port `27017`

### Step 1 — Clone the repository
```bash
git clone <your-repo-url>
cd vertexcollab
```

### Step 2 — Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET if needed
npm install
npm start
```

Backend runs at: **http://localhost:5000**

### Step 3 — Setup Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000 (already set)
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed and running

### Step 1 — Build and start all services
```bash
cd vertexcollab
docker compose up --build
```

### Step 2 — Access the app

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000       |
| Backend   | http://localhost:5000       |
| MongoDB   | mongodb://localhost:27017   |

### Step 3 — Stop services
```bash
docker compose down
```

### Step 4 — Stop and remove volumes (reset DB)
```bash
docker compose down -v
```

---

## 🔌 API Endpoints Summary

### Auth
| Method | Endpoint             | Access  | Description            |
|--------|----------------------|---------|------------------------|
| POST   | /api/auth/register   | Public  | Register a new user    |
| POST   | /api/auth/login      | Public  | Login, returns JWT     |
| GET    | /api/auth/me         | Protected | Get current user     |

### Workspaces
| Method | Endpoint              | Access    | Description              |
|--------|-----------------------|-----------|--------------------------|
| GET    | /api/workspaces       | Protected | List user's workspaces   |
| POST   | /api/workspaces       | Protected | Create workspace         |
| GET    | /api/workspaces/:id   | Protected | Get workspace by ID      |
| DELETE | /api/workspaces/:id   | Protected | Delete workspace         |

### Channels
| Method | Endpoint            | Access    | Description                         |
|--------|---------------------|-----------|-------------------------------------|
| GET    | /api/channels       | Protected | List channels (filter: ?workspace=) |
| POST   | /api/channels       | Protected | Create channel                      |
| GET    | /api/channels/:id   | Protected | Get channel by ID                   |
| DELETE | /api/channels/:id   | Protected | Delete channel                      |

### Messages
| Method | Endpoint            | Access    | Description                        |
|--------|---------------------|-----------|------------------------------------|
| GET    | /api/messages       | Protected | Get messages (filter: ?channel=)   |
| POST   | /api/messages       | Protected | Send a message                     |
| DELETE | /api/messages/:id   | Protected | Delete a message                   |

### Tasks
| Method | Endpoint         | Access    | Description                       |
|--------|------------------|-----------|-----------------------------------|
| GET    | /api/tasks       | Protected | List tasks (filter: ?workspace=)  |
| POST   | /api/tasks       | Protected | Create task                       |
| PUT    | /api/tasks/:id   | Protected | Update task (status, assignee)    |
| DELETE | /api/tasks/:id   | Protected | Delete task                       |

### Documents
| Method | Endpoint             | Access    | Description                           |
|--------|----------------------|-----------|---------------------------------------|
| GET    | /api/documents       | Protected | List documents (filter: ?workspace=)  |
| POST   | /api/documents       | Protected | Add document metadata                 |
| DELETE | /api/documents/:id   | Protected | Remove document                       |

### Admin (Admin role required)
| Method | Endpoint              | Access | Description              |
|--------|-----------------------|--------|--------------------------|
| GET    | /api/admin/stats      | Admin  | Platform statistics      |
| GET    | /api/admin/users      | Admin  | List all users           |
| DELETE | /api/admin/users/:id  | Admin  | Delete a user            |

### System
| Method | Endpoint  | Access | Description                         |
|--------|-----------|--------|-------------------------------------|
| GET    | /health   | Public | App health check                    |
| GET    | /ready    | Public | Readiness check (DB connection)     |

---

## 🔑 Default Execution Steps

1. Start the app using Docker (`docker compose up --build`) or locally
2. Open **http://localhost:3000**
3. Register a new account — select `admin` role for full access
4. Login and explore the dashboard
5. Create a **Workspace** (e.g., "Engineering")
6. Go to **Channels** → select the workspace → create a channel (e.g., `#general`)
7. Send messages in the channel
8. Go to **Tasks** → create tasks and move them across the Kanban board
9. Go to **Documents** → add document metadata records
10. If logged in as admin → visit the **Admin Panel** to see platform stats and manage users

---

## 🗺️ Planned Future DevOps Phases

This application serves as the base for the following upcoming phases:

| Phase | Tool / Technology | Description |
|-------|-------------------|-------------|
| Phase 2 | **Jenkins** | CI/CD pipeline: build, test, Dockerize, deploy |
| Phase 3 | **Terraform** | Infrastructure as Code for cloud provisioning |
| Phase 4 | **Kubernetes** | Container orchestration with k8s manifests (see `/k8s`) |
| Phase 5 | **Prometheus + Grafana** | Metrics collection and monitoring dashboards |
| Phase 6 | **ELK Stack** | Centralized logging with Elasticsearch, Logstash, Kibana |
| Phase 7 | **HashiCorp Vault** | Secrets management for JWT secrets and DB credentials |

---

## 👨‍💻 Author

**Project Vertex** — DevOps Academic Project  
Built as the foundation for demonstrating an end-to-end DevOps lifecycle on a real-world SaaS application.
