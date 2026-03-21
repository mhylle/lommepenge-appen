# Task Manager - Example App 2

A modern task management application built with Angular and NestJS, demonstrating the multi-application deployment pattern in the mhylle.com infrastructure.

## 🎯 Application Overview

This is the second example application (`app2`) showing how to add additional applications to the infrastructure. It implements a task management system with the following features:

### ✨ Features
- **Task Dashboard** with statistics and quick actions
- **Task Management** with CRUD operations
- **Priority System** (Low, Medium, High, Urgent)
- **Status Tracking** (Pending, In Progress, Completed, Cancelled)
- **Due Date Management** with calendar integration
- **Tag System** for task organization
- **RESTful API** with Swagger documentation
- **Real-time Updates** (WebSocket ready)
- **Responsive Design** with Angular Material

### 🛠️ Technology Stack
- **Frontend**: Angular 19+ with Angular Material
- **Backend**: NestJS 11+ with TypeScript
- **Database**: PostgreSQL 15 (shared instance, separate database: `app2_db`)
- **Deployment**: Docker containers with GitHub Actions CI/CD

## 🏗️ Architecture

### Routing Configuration
- **Frontend**: `https://mhylle.com/lommepenge/`
- **Backend API**: `https://mhylle.com/api/lommepenge/`
- **API Documentation**: `https://mhylle.com/api/lommepenge/docs`
- **Health Check**: `https://mhylle.com/api/lommepenge/health`

### Database Schema
```sql
-- Tasks table for app2_db
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    tags TEXT[],
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Access to shared PostgreSQL instance

### Local Development

1. **Clone and setup environment**:
   ```bash
   git clone <your-app2-repository>
   cd app2
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies**:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Start development servers**:
   ```bash
   # Frontend (runs on http://localhost:4200/lommepenge/)
   cd frontend
   npm run start
   
   # Backend (runs on http://localhost:3000/api/lommepenge/)
   cd backend
   npm run start:dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:4200/lommepenge/
   - API: http://localhost:3000/api/lommepenge/
   - API Docs: http://localhost:3000/api/lommepenge/docs

### Docker Development

```bash
# Build and run locally
docker-compose up --build

# Access via nginx proxy (if infrastructure is running)
# Frontend: https://mhylle.com/lommepenge/
# API: https://mhylle.com/api/lommepenge/
```

## 📦 Production Deployment

### Automated Deployment (Recommended)

1. **Setup GitHub repository** with this code
2. **Configure GitHub Secrets**:
   ```
   SERVER_HOST: your-server-ip
   SERVER_USER: mhylle
   SERVER_SSH_KEY: your-private-ssh-key
   ```
3. **Push to main branch** - GitHub Actions will handle the rest

### Manual Deployment

```bash
# On your server
cd /home/mhylle/projects/mhylle.com

# Deploy the application
./scripts/deploy-app.sh app2 \
  ghcr.io/username/app2-frontend:latest \
  ghcr.io/username/app2-backend:latest

# Verify deployment
./scripts/health-check.sh app2
```

### Database Setup

```bash
# Create the app2 database (run once)
docker exec -it mhylle-postgres psql -U mhylle_user -d mhylle_main
CREATE DATABASE app2_db;
GRANT ALL PRIVILEGES ON DATABASE app2_db TO mhylle_user;
\q

# Run migrations (after backend deployment)
docker exec app2-backend npm run migration:run
```

## 🔧 Configuration

### Environment Variables

#### Frontend Configuration
```bash
# Build time configuration
NG_APP_API_URL=/api/lommepenge
NG_APP_BASE_HREF=/lommepenge/
NG_APP_NAME="Task Manager"
```

#### Backend Configuration
```bash
# Runtime configuration
NODE_ENV=production
PORT=3000
POSTGRES_HOST=mhylle-postgres
POSTGRES_PORT=5432
POSTGRES_DB=app2_db
POSTGRES_USER=mhylle_user
POSTGRES_PASSWORD=your_password
APP2_JWT_SECRET=your_unique_jwt_secret
```

### Nginx Configuration
The application routing is defined in `/infrastructure/nginx/apps/app2.conf`:
- Handles subpath routing for `/lommepenge/`
- API proxying for `/api/lommepenge/`
- Static asset optimization
- CORS configuration
- Rate limiting

## 🧪 Testing

### Frontend Testing
```bash
cd frontend

# Unit tests
npm run test

# Unit tests (CI mode)
npm run test:ci

# Linting
npm run lint

# Build test
npm run build:prod
```

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/lommepenge/auth/login` - User login
- `POST /api/lommepenge/auth/register` - User registration
- `POST /api/lommepenge/auth/refresh` - Token refresh

### Task Management Endpoints
- `GET /api/lommepenge/tasks` - List all tasks
- `GET /api/lommepenge/tasks/stats` - Get task statistics
- `GET /api/lommepenge/tasks/:id` - Get specific task
- `POST /api/lommepenge/tasks` - Create new task
- `PATCH /api/lommepenge/tasks/:id` - Update task
- `DELETE /api/lommepenge/tasks/:id` - Delete task

### Health & Monitoring
- `GET /api/lommepenge/health` - Health check endpoint
- `GET /api/lommepenge/docs` - Swagger API documentation

### Example API Usage

```bash
# Get all tasks
curl -X GET "https://mhylle.com/api/lommepenge/tasks" \
  -H "Authorization: Bearer your_jwt_token"

# Create a new task
curl -X POST "https://mhylle.com/api/lommepenge/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "title": "Setup monitoring",
    "description": "Configure application monitoring",
    "priority": "high",
    "dueDate": "2025-08-15T10:00:00Z",
    "tags": ["infrastructure", "monitoring"]
  }'

# Get task statistics
curl -X GET "https://mhylle.com/api/lommepenge/tasks/stats" \
  -H "Authorization: Bearer your_jwt_token"
```

## 🔍 Monitoring & Maintenance

### Health Monitoring
```bash
# Check application health
./scripts/health-check.sh app2

# Check specific components
curl -I https://mhylle.com/lommepenge/
curl -I https://mhylle.com/api/lommepenge/health
```

### Log Management
```bash
# View application logs
./scripts/logs.sh app2

# View specific service logs
docker logs app2-frontend
docker logs app2-backend

# Follow logs in real-time
./scripts/logs.sh app2 --follow
```

### Performance Monitoring
```bash
# Check container resources
docker stats app2-frontend app2-backend

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://mhylle.com/lommepenge/
```

## 🚨 Troubleshooting

### Common Issues

#### Application Not Loading
```bash
# Check container status
docker ps | grep app2

# Check container logs
docker logs app2-frontend
docker logs app2-backend

# Verify nginx configuration
docker exec mhylle-nginx nginx -t
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec app2-backend npm run typeorm -- query "SELECT NOW()"

# Check database exists
docker exec -it mhylle-postgres psql -U mhylle_user -c "\l" | grep app2_db
```

#### Routing Issues
```bash
# Test frontend routing
curl -I https://mhylle.com/lommepenge/
curl -I https://mhylle.com/lommepenge/dashboard

# Test API routing
curl -I https://mhylle.com/api/lommepenge/health
curl -I https://mhylle.com/api/lommepenge/tasks
```

### Recovery Procedures

#### Rollback Deployment
```bash
# Rollback to previous version
./scripts/rollback-app.sh app2
```

#### Restart Services
```bash
# Restart application containers
docker-compose -f applications/lommepenge/docker-compose.yml restart

# Restart specific service
docker restart app2-backend
```

#### Database Recovery
```bash
# Restore from backup
./scripts/restore-db.sh app2_backup.sql
```

## 🔒 Security Considerations

### Authentication & Authorization
- JWT-based authentication
- Secure password hashing
- Role-based access control (future enhancement)

### API Security
- Rate limiting on all endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention with TypeORM

### Infrastructure Security
- HTTPS-only communication
- Security headers implementation
- Container isolation
- Non-root user execution

## 📈 Performance Optimization

### Frontend Optimization
- Lazy loading of routes
- OnPush change detection strategy
- Service worker for caching (future)
- Bundle optimization and tree shaking

### Backend Optimization
- Database connection pooling
- Query optimization with indexes
- Response caching headers
- Compression middleware

### Infrastructure Optimization
- Nginx caching for static assets
- Gzip compression
- HTTP/2 support
- CDN-ready asset serving

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
1. **Test Phase**: Frontend/backend testing and linting
2. **Build Phase**: Docker image building and pushing to GHCR
3. **Deploy Phase**: Automated deployment to production server
4. **Verify Phase**: Health checks and endpoint testing

### Deployment Process
1. Code push triggers GitHub Actions
2. Tests run automatically
3. Docker images built and pushed to registry
4. Server deployment via SSH
5. Health verification
6. Rollback on failure

## 🎛️ Configuration Management

### Environment-Specific Settings
- Development: Local database, hot reload, debug logging
- Production: Shared database, optimized builds, structured logging
- Testing: In-memory database, mock services

### Feature Flags
```bash
ENABLE_SWAGGER_DOCS=true
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true
ENABLE_ANALYTICS=false
```

## 📋 Development Workflow

### Adding New Features
1. Create feature branch
2. Implement frontend/backend changes
3. Add/update tests
4. Update API documentation
5. Test locally with Docker
6. Create pull request
7. Deploy after review approval

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- -n AddNewFeature

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the application logs: `./scripts/logs.sh app2`
2. Verify health status: `./scripts/health-check.sh app2`
3. Review the troubleshooting section above
4. Check the main infrastructure documentation

---

**Task Manager App2** - Demonstrating scalable multi-application deployment with the mhylle.com infrastructure.
# Deployment triggered at Sun Aug 10 13:01:26 CEST 2025
# Trigger deployment Sun Aug 10 18:30:58 CEST 2025
# Trigger deployment after fixes
# Last updated: Fri Oct  3 22:48:29 CEST 2025
