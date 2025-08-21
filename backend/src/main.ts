import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultResultOrder } from 'dns';

// Force DNS to resolve IPv4 first to avoid IPv6 localhost issues
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for development and production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://mhylle.com', 'https://www.mhylle.com']
      : ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  // Health check endpoints (required for Docker health checks)
  // App2 uses a different path structure
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      application: 'App2 Backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  app.use('/api/app2/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      application: 'App2 Backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 App2 Backend is running on port ${port}`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log(`🏥 API Health Check: http://localhost:${port}/api/app2/health`);
}
bootstrap();
