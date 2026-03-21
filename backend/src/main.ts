import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultResultOrder, lookup } from 'dns';
import { promisify } from 'util';
import * as cookieParser from 'cookie-parser';

// Force DNS to resolve IPv4 first to avoid IPv6 localhost issues
setDefaultResultOrder('ipv4first');

// Additional DNS resolution fix - ensure hostname resolution works correctly
const dnsLookup = promisify(lookup);
async function ensureIPv4Resolution() {
  try {
    if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
      const result = await dnsLookup(process.env.DB_HOST, { family: 4 });
      console.log(
        `✅ DNS Resolution for ${process.env.DB_HOST}: ${result.address}`,
      );
    }
  } catch (error) {
    console.warn(
      `⚠️ DNS Resolution warning for ${process.env.DB_HOST}:`,
      error.message,
    );
  }
}

async function bootstrap() {
  // Ensure DNS resolution is working correctly before starting the app
  await ensureIPv4Resolution();

  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for SSO cookie-based authentication
  app.use(cookieParser());

  // Enable CORS for development and production
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://mhylle.com', 'https://www.mhylle.com']
        : ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
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

  app.use('/api/lommepenge/health', (req, res) => {
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
  console.log(`🏥 API Health Check: http://localhost:${port}/api/lommepenge/health`);
}
bootstrap();
