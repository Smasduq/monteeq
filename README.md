# 🎥 Monteeq

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Rust](https://img.shields.io/badge/Media_Service-Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Monteeq** is a high-performance, full-stack video platform designed for creators. It features a modern React-based interface, a robust FastAPI backend, and a specialized Rust-powered processing engine for high-efficiency video transcoding.

---

## ✨ Key Features

- 🌓 **Modern UI/UX**: Responsive dark-mode interface built with React, Vite, and Framer Motion for smooth animations.
- 📂 **Multi-Format Video Support**: Support for 'Home' (standard) and 'Flash' (short-form) video types.
- ⚡ **High-Speed Transcoding**: Dedicated Rust microservice for heavy video processing tasks.
- 📊 **Creator Analytics**: Advanced performance tracking with monthly growth insights and interactive charts.
- 💬 **Social Interactions**: Threaded comment system, likes, reposts, and real-time notifications.
- 🏆 **Achievement System**: Milestone tracking for creators to reward engagement.
- ☁️ **S3-Compatible Storage**: Seamlessly integrated with Backblaze B2 for scalable media hosting.
- 🔐 **Secure Authentication**: Google OAuth2 integration and JWT-based session management.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: React Context & Hooks
- **Styling**: Vanilla CSS (Custom UI patterns)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Asynchronous I/O**: [Httpx](https://www.python-httpx.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Media Engine**: [Rust](https://www.rust-lang.org/) (FFmpeg integration)

### Infrastructure
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Cloud Storage**: [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) (S3-API)

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- Python 3.10+ (for local development)
- Node.js 18+ (for local development)

### One-Command Setup (Docker)
The easiest way to get Monteeq running is using Docker Compose:

```bash
docker-compose up --build
```

This will spin up:
- **Backend API**: `http://localhost:8000`
- **Frontend App**: `http://localhost:80`
- **Video Service**: `http://localhost:8081`
- **Database**: PostgreSQL on port `5432`

### Environmental Configuration
Create a `.env` file in the `backend/` directory based on the following template:

```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/monteeq
SECRET_KEY=your_super_secret_key
S3_ACCESS_KEY=your_b2_key_id
S3_SECRET_KEY=your_b2_application_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=your_region
```

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User]) -->|Interacts| Frontend[React Frontend]
    Frontend -->|API Requests| Backend[FastAPI Backend]
    Backend -->|Auth| Google[Google OAuth]
    Backend -->|Query/Update| Postgres[(PostgreSQL)]
    Backend -->|Enqueue Processing| VideoWorker[Rust Video Service]
    VideoWorker -->|Transcode| FFmpeg[FFmpeg Engine]
    FFmpeg -->|Store Fragments| B2[Backblaze B2 Storage]
    B2 -->|CDN Delivery| User
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">Made with ❤️ for the Creative Community</p>