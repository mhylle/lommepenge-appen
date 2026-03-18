import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    return "Velkommen til Lommepenge App'en!";
  }

  getInfo() {
    return {
      application: "Lommepenge App'en - Living Scrapbook",
      version: '1.0.0',
      description: 'Danish pocket money tracker for families',
      message: "Velkommen til Lommepenge App'en!",
      features: [
        'Family Management',
        'Pocket Money Tracking',
        'Polaroid-Style Child Cards',
        'Transaction Stickers',
        'Celebratory Animations',
        'Living Scrapbook Design',
      ],
      endpoints: {
        health: '/health',
        api: '/api/app2',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
