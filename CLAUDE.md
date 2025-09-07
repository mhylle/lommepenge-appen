# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is "Example App 2" - a task management application built with Angular 19 frontend and NestJS 11 backend. It's part of the mhylle.com multi-application infrastructure that demonstrates subpath routing and shared PostgreSQL database architecture.

## Common Development Commands

### Frontend (Angular 19) - /frontend
```bash
# Development
npm start                    # Start dev server with proxy (http://localhost:4200)
npm run build               # Build for production
npm run build:prod          # Build with base-href="/app2/" for deployment
npm run serve:prod          # Serve production build locally

# Testing
npm test                    # Run unit tests
npm run test:ci             # Run tests in CI mode (headless Chrome)

# Linting & Quality
npm run lint                # Run ESLint
ng lint                     # Alternative linting command
```

### Backend (NestJS 11) - /backend
```bash
# Development
npm run start:dev           # Start with hot-reload
npm run start:debug         # Start with debugging enabled
npm start                   # Standard start
npm run start:prod          # Production start

# Testing
npm test                    # Run unit tests
npm run test:watch          # Run tests in watch mode
npm run test:cov            # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Build & Quality
npm run build              # Build TypeScript
npm run format             # Format code with Prettier
npm run lint               # Run ESLint with auto-fix
```

### Docker Development
```bash
# Run the application stack
docker-compose up --build

# Access application
# Frontend: http://localhost:3002 (or via nginx proxy)
# Backend: http://localhost:8002 (or via nginx proxy at /api/app2/)
```

## Architecture Overview

### Application Structure
This is a **task management system** with the following key features:
- Dashboard with task statistics and quick actions
- Task CRUD operations with priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Cancelled)
- Due date management and tag system
- Authentication guards protecting routes

### Technology Stack
- **Frontend**: Angular 19 with Angular Material UI components
- **Backend**: NestJS 11 with TypeORM and PostgreSQL
- **Database**: PostgreSQL (shared instance with app-specific database `app2_db`)
- **Deployment**: Docker containers with nginx reverse proxy

### Subpath Routing Configuration
The application is designed for subpath deployment:
- **Frontend**: Served at `/app2/` (configured with `baseHref: "/app2/"`)
- **Backend API**: Accessible at `/api/app2/` (nginx strips prefix before forwarding)
- **Health Check**: `/api/app2/health` endpoint for monitoring

### Database Architecture
- Uses shared PostgreSQL instance (`mhylle-postgres`)
- Application-specific database: `app2_db`
- TypeORM for database operations and migrations
- Environment variables: `DB_HOST=mhylle-postgres`, `DB_NAME=app2_db`

### Key Components & Services

#### Frontend Architecture
- **Routing**: App routes defined in `app-routing.module.ts` with AuthGuard protection
- **Components**: Dashboard, TaskList, TaskForm, AccessDenied components
- **Services**: AuthService for authentication, guard services for route protection
- **Material Design**: Uses Angular Material with indigo-pink theme

#### Backend Architecture  
- **Main Application**: Bootstrap in `main.ts` with CORS configuration and health endpoints
- **Modules**: Tasks module, Database module, Health module, App module
- **Services**: TasksService for business logic (currently minimal implementation)
- **Entities**: Task entity with UUID primary key, status, priority, due dates
- **Health Endpoints**: `/health` and `/api/app2/health` for monitoring

### Docker Configuration
- **Networks**: Uses both `app2-network` (internal) and `mhylle-network` (external)
- **Frontend Container**: Nginx serving static assets on port 80 (exposed as 3002)
- **Backend Container**: NestJS app on port 3000 (exposed as 8002)
- **Health Checks**: Configured for both containers with curl-based tests
- **Environment Variables**: Database connection, JWT secrets, Node environment

### Critical DNS & Database Fixes
The backend includes special DNS resolution fixes:
- Forces IPv4-first DNS resolution to avoid IPv6 localhost issues
- DNS lookup validation on startup for database host resolution
- This prevents connection issues in Docker environments

## Development Workflow

### Local Development Setup
1. Install dependencies in both `/frontend` and `/backend` directories
2. Configure environment variables for database connection
3. Start backend with `npm run start:dev`
4. Start frontend with `npm start` (includes proxy configuration)
5. Access app at `http://localhost:4200/app2/`

### Building for Production
- Frontend: `npm run build:prod` (includes correct base-href)
- Backend: `npm run build` followed by `npm run start:prod`
- Docker: `docker-compose up --build` for full stack

### Testing Strategy
- **Frontend**: Karma/Jasmine unit tests, ESLint for code quality
- **Backend**: Jest unit tests with coverage, E2E tests, ESLint + Prettier
- **Integration**: Health check endpoints for deployment verification

## Critical Configuration Notes

### Angular Configuration
- **Base Href**: Configured for `/app2/` in both development and production
- **Proxy Config**: `proxy.conf.json` for local development API routing
- **Build Budgets**: Initial bundle limit of 2MB, component styles limit of 8KB
- **Material Theme**: Uses prebuilt indigo-pink theme

### NestJS Configuration  
- **CORS**: Configured for both localhost and production domains
- **Health Endpoints**: Multiple health check paths for different access patterns
- **Port Binding**: Binds to `0.0.0.0` for Docker container accessibility
- **TypeORM**: Database connection with environment-based configuration

### Docker & Networking
- **Port Mapping**: Frontend 3002:80, Backend 8002:3000
- **Network Architecture**: Dual network setup for internal and external communication
- **Health Checks**: Curl-based health checks with appropriate timeouts and retries
- **Logging**: JSON file logging with size and rotation limits

## Common Issues & Solutions

### Frontend Issues
- **Routing Problems**: Ensure `baseHref` is set correctly in angular.json
- **API Access**: Check proxy configuration in development, verify nginx routing in production
- **Build Failures**: Check bundle size limits in angular.json budgets configuration

### Backend Issues  
- **Database Connection**: Verify `DB_HOST=mhylle-postgres` and database exists (`app2_db`)
- **Health Check Failures**: Ensure health endpoints respond correctly at `/health` and `/api/app2/health`
- **CORS Errors**: Verify CORS configuration includes correct origins for environment

### Docker Issues
- **Container Startup**: Check health check endpoints and network connectivity
- **Database Access**: Ensure containers are on correct networks (`mhylle-network`)
- **Image Building**: Verify Dockerfiles and build contexts are correct

## Security & Performance Notes

### Security Measures
- **CORS Configuration**: Environment-specific origins, proper headers and credentials
- **Route Guards**: AuthGuard protects all main application routes
- **JWT Authentication**: Backend configured for JWT-based authentication
- **Health Check Security**: Health endpoints provide system information without sensitive data

### Performance Configuration
- **Angular Build**: Tree shaking, output hashing, bundle optimization enabled
- **Docker Logging**: Log rotation configured to prevent disk space issues
- **Health Check Intervals**: Balanced for monitoring without resource overhead
- **Database Connection**: TypeORM connection pooling for backend efficiency

## Integration with mhylle.com Infrastructure

This application is designed to integrate with the larger mhylle.com infrastructure:
- **Shared PostgreSQL**: Uses common database instance with app-specific database
- **Nginx Reverse Proxy**: External nginx handles routing and SSL termination
- **Watchtower Integration**: Labels configured for automatic deployment updates
- **Network Integration**: Connects to shared `mhylle-network` for infrastructure communication