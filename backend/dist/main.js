"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dns_1 = require("dns");
const util_1 = require("util");
(0, dns_1.setDefaultResultOrder)('ipv4first');
const dnsLookup = (0, util_1.promisify)(dns_1.lookup);
async function ensureIPv4Resolution() {
    try {
        if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
            const result = await dnsLookup(process.env.DB_HOST, { family: 4 });
            console.log(`✅ DNS Resolution for ${process.env.DB_HOST}: ${result.address}`);
        }
    }
    catch (error) {
        console.warn(`⚠️ DNS Resolution warning for ${process.env.DB_HOST}:`, error.message);
    }
}
async function bootstrap() {
    await ensureIPv4Resolution();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://mhylle.com', 'https://www.mhylle.com']
            : ['http://localhost:4200', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        credentials: true,
    });
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
//# sourceMappingURL=main.js.map